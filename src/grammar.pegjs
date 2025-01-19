// Functions
{
  function jsonToXml(json) {
    if (typeof json === "string") return json;

    if (Array.isArray(json)) {
      return json.map(jsonToXml).join('');
    }

    return Object.entries(json)
      .map(([key, value]) => `<${key}>${jsonToXml(value)}</${key}>`)
      .join('');
  }

  function xmlToJson(tag, content) {
    if (!content) return { [tag]: '' };

    const children = content.match(/<([^>]+)>(.*?)<\/\1>/gs) || [];
    if (!children.length) return { [tag]: content.trim() };

    const result = {};
    children.forEach((child) => {
      const [, childTag, childContent] = child.match(/<([^>]+)>(.*?)<\/\1>/s);
      if (result[childTag]) {
        if (!Array.isArray(result[childTag])) result[childTag] = [result[childTag]];
        result[childTag].push(xmlToJson(childTag, childContent)[childTag]);
      } else {
        result[childTag] = xmlToJson(childTag, childContent)[childTag];
      }
    });
    return { [tag]: result };
  }
}

// Start rule
start
  = json
  / xml

// JSON Parsing
json
  = obj:object { return jsonToXml(obj); }

object
  = "{" _ members:members? _ "}" { return members || {}; }

members
  = firstPair:pair restPairs:("," _ pair)* {
      const result = {};
      result[firstPair.key] = firstPair.value;
      restPairs.forEach(([,, pair]) => result[pair.key] = pair.value);
      return result;
    }

pair
  = key:string _ ":" _ value:value { return { key, value }; }

value
  = string
  / number
  / object
  / array
  / "true" { return true; }
  / "false" { return false; }
  / "null" { return null; }

array
  = "[" _ elements:elements? _ "]" { return elements || []; }

elements
  = firstElement:value restElements:("," _ value)* {
      return [firstElement, ...restElements.map(([,, value]) => value)];
    }

string
  = "\"" chars:([^"\\] / "\\\"")* "\"" { return chars.join(''); }

number
  = digits:[0-9]+ { return parseInt(digits.join(''), 10); }

// XML Parsing
xml
  = "<" tag:tagName ">" _ content:xmlContent* _ "</" closingTag:tagName ">" {
      if (tag !== closingTag) {
        throw new Error(`Mismatched tags: expected </${tag}>, found </${closingTag}>`);
      }
      const children = content.length === 1 ? content[0] : content;
      if (typeof children === "string") {
        return xmlToJson(tag, children.trim());
      } else {
        const result = {};
        content.forEach((child) => {
          if (typeof child === "object" && child !== null) {
            const [key, value] = Object.entries(child)[0];
            if (result[key]) {
              if (!Array.isArray(result[key])) result[key] = [result[key]];
              result[key].push(value);
            } else {
              result[key] = value;
            }
          }
        });
        return { [tag]: result };
      }
    }

xmlContent
  = xml
  / text

text
  = chars:[^<]+ { return chars.join('').trim(); }

tagName
  = chars:[a-zA-Z0-9_]+ { return chars.join(''); }

// Whitespace
_ "Whitespace"
  = [ \t\n\r]*


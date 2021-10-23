
const input = `This is text
with a soft break

This is a new paragraph
> with a
> block
> quote

And a final paragraph with some ~~strikethrough~~ text`;

function parseLine(line) {
  const parts = line.split('~~');
  if (parts.length > 2) {
    line = parts[0];
    for (let i = 1; i < parts.length; i += 1) {
      if (i % 2 === 1) {
        if (i+1 < parts.length) {
          line += '<strike>' + parts[i];
        } else {
          line += '~~' + parts[i];
        }
      } else {
        line += '</strike>' + parts[i];
      }
    }
  }
  return line;
}

//console.log(parseLine("A ~~normal~~ test"));
//console.log(parseLine("A ~~abnormal test"));
//console.log(parseLine("A ~~normal~~ and ~~abnormal test"));

function parse(input) {
  const lines = input.split('\n');
  let result = ['<p>'];
  let inBlock = false;
  
  for (let i = 0; i < lines.length; i += 1) {
    let line = lines[i];
    if (line.length === 0) {
        result.push('</p>');
        result.push('<p>');
    } else {
      if (line[0] === '>') {
        if (inBlock) {
          line = parseLine(line.slice(2));
        } else {
          result.push('<blockquote>');
          line =  parseLine(line.slice(2));
          inBlock = true;
        }
      } else {
        line = parseLine(line);
      }

      let nextline = i+1 < lines.length ? lines[i+1] : '#';

      if (nextline.length !== 0) {
        line = line + '<br/>';
      }
      
      result.push(line);
      
      if (inBlock && nextline[0] !== '>') {
        result.push('</blockquote>');
        inBlock = false;
      } 
    }
  }
  
  result.push('</p>');
  
  return result.join('\n');
}

console.log(parse(input));

console.log(parse(`This is a paragraph with a soft break here
and here
and here
but not here

This is a paragraph with a soft break here
> and a single line block quote with ~~normal strike through~~ and ~~abnormal strikethrough
completely contained in a paragraph

Could you ask for anything more?`));
// Parse JSON object or string
export function parseObjectOrStringJSON(name: string, param?: Record<string, unknown> | string): string {
  if (typeof param === 'undefined') {
    return '';
  }

  let parsedObj: Record<string, unknown> = {};

  if (typeof param === 'string') {
    try {
      parsedObj = JSON.parse(param);
    } catch (e) {
      console.error(
        `The '${name}' prop is not a valid JSON string. This prop can either be a JSON string or JSON object.`
      );
      return '';
    }
  } else {
    parsedObj = param;
  }

  // Replace % symbols with %25
  for (const key in parsedObj) {
    if (typeof parsedObj[key] === 'string') {
      parsedObj[key] = (parsedObj[key] as string).replace(/%(?!25)/g, '%25');
    }
  }

  return JSON.stringify(parsedObj);
}

export function parseObjectOrStringJSONToRecord(
  name: string,
  param?: Record<string, unknown> | string
): Record<string, unknown> {
  if (typeof param === 'undefined') {
    return {};
  }

  let parsedObj: Record<string, unknown> = {};

  if (typeof param === 'string') {
    try {
      parsedObj = JSON.parse(param);
    } catch (e) {
      console.error(
        `The '${name}' prop is not a valid JSON string. This prop can either be a JSON string or JSON object.`
      );
      return {};
    }
  } else {
    parsedObj = param;
  }

  return parsedObj;
}

export function sanitizeKey(input: string): string {
  let result = input.toLowerCase().replace(/\s/g, '_');
  result = result.replace(/[^a-zA-Z0-9_]/g, '');
  return result;
}

export function isValidColor(color: string): boolean {
  return /^#([0-9A-F]{3}){1,2}$/i.test(color);
}

export function expandHex(color: string): string {
  if (color.length === 4) {
    color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  return color;
}

export function darkenColor(color: string, percent: number): string {
  if (!isValidColor(color)) return color;

  color = expandHex(color);

  const num = parseInt(color.replace('#', ''), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) - amt,
    B = ((num >> 8) & 0x00ff) - amt,
    G = (num & 0x0000ff) - amt;

  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
      (G < 255 ? (G < 1 ? 0 : G) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export function classes(classList: (string | false | undefined | null)[]): string {
  return classList.filter(Boolean).join(' ');
}


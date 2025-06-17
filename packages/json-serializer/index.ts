function convertValueToString(
  value: unknown,
  visited: Set<object>,
  space: string,
  level: number
): string | undefined {
  if (value === null) return 'null';

  switch (typeof value) {
    case 'string': return `"${value}"`;
    case 'number':
    case 'boolean': return String(value);
    case 'undefined':
    case 'function': return undefined;
  }

  // Для объектов и массивов проверяем циклическую ссылку
  if (typeof value === 'object') {
    if (visited.has(value)) {
      throw new TypeError('Converting circular structure to JSON');
    }
    visited.add(value);
  }

  try { // Используем try...finally, чтобы гарантированно удалить из visited
    if (Array.isArray(value)) {
      const parts = value.map(item => {
        const strItem = convertValueToString(item, visited, space, level + 1);
        return strItem === undefined ? 'null' : strItem;
      });

      if (!space) return `[${parts.join(',')}]`;
      
      const indent = space.repeat(level - 1);
      const innerIndent = space.repeat(level);
      if (parts.length === 0) return '[]';
      return `[\n${parts.map(p => `${innerIndent}${p}`).join(',\n')}\n${indent}]`;
    }

    if (typeof value === 'object' && value !== null) {
      const parts: string[] = [];
      for (const key of Object.keys(value)) {
        const val = (value as Record<string, any>)[key];
        const serializedValue = convertValueToString(val, visited, space, level + 1);
        if (serializedValue !== undefined) {
          const formattedKey = `"${key}"`;
          const separator = space ? ': ' : ':';
          parts.push(`${formattedKey}${separator}${serializedValue}`);
        }
      }
      
      if (!space) return `{${parts.join(',')}}`;

      const indent = space.repeat(level - 1);
      const innerIndent = space.repeat(level);
      if (parts.length === 0) return '{}';
      return `{\n${parts.map(p => `${innerIndent}${p}`).join(',\n')}\n${indent}}`;
    }
  } finally {
    if (typeof value === 'object') {
      visited.delete(value); // Гарантированно удаляем после всех операций
    }
  }

  return undefined;
}

export class MyJSON {
  public static stringify(
    obj: unknown,
    replacer: null = null, // replacer пока не используем
    space?: number | string
  ): string | undefined {
    let spaceString = '';
    if (typeof space === 'number') {
      spaceString = ' '.repeat(Math.min(space, 10)); // Нативный stringify ограничен 10 пробелами
    } else if (typeof space === 'string') {
      spaceString = space.slice(0, 10); // И строкой из 10 символов
    }
    return convertValueToString(obj, new Set(), spaceString, 1);
  }
}

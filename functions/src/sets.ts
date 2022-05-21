export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
    return new Set([...a, ...b])
}

export function differene<T>(a: Set<T>, b: Set<T>): Set<T> {
    const result = new Set([...a])
    b.forEach(it => result.delete(it));
    return result;
}

export function equal(a: Set<string>, b: Set<string>) {
    return Array.from(a).join('|') === Array.from(b).join('|');
}
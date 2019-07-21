export function isNicknameValid(nickname: string): boolean {
    return /^[A-Za-z0-9]{3,}$/.test(nickname);
}
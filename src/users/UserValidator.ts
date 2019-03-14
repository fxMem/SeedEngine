export function isNicknameValid(nickname: string): boolean {
    return /^[a-z0-9]{3,}$/.test(nickname);
}
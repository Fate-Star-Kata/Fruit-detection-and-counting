export const svgToBase64 = (svg: string): string => {
    const encoder = new TextEncoder()
    const uint8Array = encoder.encode(svg)
    let binary = ''
    uint8Array.forEach(byte => {
        binary += String.fromCharCode(byte)
    })
    return btoa(binary)
}
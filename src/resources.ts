const resources: string[] = []


export function getImageList(): string [] {
  if (resources.length == 0) {
    for (let i = 1; i <= 65; ++i) {
      resources.push(`qilin (${i}).jpg`)
    }
    resources.push('qilin (1).gif')
    resources.push('qilin (1).webp')
    resources.push('qilin (2).webp')
    resources.push('qilin (3).webp')
    resources.push('qilin (4).webp')
  }
  return resources
}
// scripts/seedLocalBooks.ts
import fs from "fs"
import path from "path"
import { prisma } from "../src/app/lib/prisma"
import { uploadRawFile } from "../src/app/lib/cloudinary"

async function main() {
  const booksDir = path.join(process.cwd(), "books")
  const files = fs.readdirSync(booksDir).filter((f) => f.endsWith(".epub") || f.endsWith(".pdf"))

  for (const file of files) {
    const filePath = path.join(booksDir, file)
    const stats = fs.statSync(filePath)

    // ✅ Skip files larger than 10 MB (Cloudinary free limit)
    const maxSize = 10 * 1024 * 1024 // 10 MB
    if (stats.size > maxSize) {
      console.warn(`⚠️ Skipping ${file} (size ${Math.round(stats.size / 1024 / 1024)} MB > 10 MB limit)`)
      continue
    }

    try {
      console.log(`📚 Uploading ${file}...`)
      const cloudUrl = await uploadRawFile(filePath, `seed_${file.replace(/\.[^/.]+$/, "")}`)

      await prisma.book.create({
        data: {
          title: file.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, ""), // nicer title
          priceCents: 0, // free
          currency: "USD",
          inventory: 100,
          googleVolumeId: null,
          fileUrl: cloudUrl,
        },
      })

      console.log(`✅ Saved: ${file} -> ${cloudUrl}`)
    } catch (err) {
      console.error(`❌ Error uploading ${file}`, err)
    }
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

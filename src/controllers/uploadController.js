import multer from 'multer'
import { supabaseAdmin } from '../config/supabase.js'

// In-memory storage for multer — stream to Supabase Storage or data URI
const storage = multer.memoryStorage()
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('نوع الملف غير مسموح — يُقبل فقط JPEG, PNG, WebP, AVIF'))
    }
  }
})

/**
 * POST /api/upload/product-image
 * Upload a product image to Supabase Storage or generate data URL in local dev.
 */
export async function uploadProductImage(req, res, next) {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ error: 'لم يتم إرسال صورة' })
    }

    const { product_id, color_id } = req.body

    if (!product_id) {
      return res.status(400).json({ error: 'معرّف المنتج مطلوب' })
    }

    const MIME_TO_EXT = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif'
    }

    if (supabaseAdmin) {
      try {
        const ext = MIME_TO_EXT[file.mimetype] || 'jpg'
        const filename = `${product_id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

        const { error: uploadError } = await supabaseAdmin.storage
          .from('product-images')
          .upload(filename, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '31536000'
          })

        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(filename)

          const publicUrl = urlData.publicUrl

          const { data: imageRow, error: dbError } = await supabaseAdmin
            .from('product_images')
            .insert({
              product_id,
              color_id: color_id || null,
              url: publicUrl,
              sort_order: 0
            })
            .select()
            .single()

          if (!dbError && imageRow) {
            return res.status(201).json({
              id: imageRow.id,
              url: publicUrl
            })
          }

          return res.status(201).json({
            id: 'img-' + Date.now(),
            url: publicUrl
          })
        }
      } catch (err) {
        console.warn('Supabase storage upload fallback:', err.message)
      }
    }

    // Local / Dev Fallback: Data URL
    const base64 = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    res.status(201).json({
      id: 'img-local-' + Date.now(),
      url: base64
    })
  } catch (err) {
    next(err)
  }
}

/**
 * DELETE /api/upload/product-image/:id
 */
export async function deleteProductImage(req, res, next) {
  try {
    const { id } = req.params

    if (supabaseAdmin) {
      try {
        const { data: image, error: fetchError } = await supabaseAdmin
          .from('product_images')
          .select('url')
          .eq('id', id)
          .single()

        if (!fetchError && image?.url) {
          const url = new URL(image.url)
          const pathParts = url.pathname.split('/storage/v1/object/public/product-images/')
          if (pathParts[1]) {
            await supabaseAdmin.storage
              .from('product-images')
              .remove([pathParts[1]])
          }
          await supabaseAdmin.from('product_images').delete().eq('id', id)
        }
      } catch {
        /* fallback */
      }
    }

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
}

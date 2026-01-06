/**
 * Gallery Management Routes
 * Bulk media upload with progress tracking
 */

import { Router } from 'express';
import { requireAdmin, isAuthenticated } from '../../middleware/auth';
import multer from 'multer';

const router = Router();

// Configure multer for multiple file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB per file
    files: 50 // Max 50 files per batch
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  }
});

// Types
interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  mimeType: string;
  tags: string[];
  category?: string;
  alt?: string;
  caption?: string;
  order: number;
  featured: boolean;
  creatorId?: string;
  creatorName?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface UploadBatch {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  items: { filename: string; status: string; error?: string; itemId?: string }[];
  startedAt: string;
  completedAt?: string;
}

// Mock gallery data
let galleryItems: GalleryItem[] = [
  {
    id: 'gallery_001',
    type: 'image',
    url: 'https://cdn.fanz.website/gallery/photo1.jpg',
    thumbnailUrl: 'https://cdn.fanz.website/gallery/thumb/photo1.jpg',
    filename: 'photo1.jpg',
    size: 2456789,
    width: 1920,
    height: 1080,
    mimeType: 'image/jpeg',
    tags: ['featured', 'outdoor'],
    category: 'photos',
    alt: 'Creator outdoor photoshoot',
    caption: 'Summer vibes!',
    order: 1,
    featured: true,
    creatorId: 'creator_001',
    creatorName: 'Jake Thunder',
    uploadedBy: 'admin',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gallery_002',
    type: 'video',
    url: 'https://cdn.fanz.website/gallery/video1.mp4',
    thumbnailUrl: 'https://cdn.fanz.website/gallery/thumb/video1.jpg',
    filename: 'workout.mp4',
    size: 45678901,
    width: 1920,
    height: 1080,
    duration: 180,
    mimeType: 'video/mp4',
    tags: ['fitness', 'workout'],
    category: 'videos',
    alt: 'Morning workout routine',
    caption: 'Starting the day right!',
    order: 2,
    featured: false,
    creatorId: 'creator_001',
    creatorName: 'Jake Thunder',
    uploadedBy: 'admin',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gallery_003',
    type: 'image',
    url: 'https://cdn.fanz.website/gallery/photo2.jpg',
    thumbnailUrl: 'https://cdn.fanz.website/gallery/thumb/photo2.jpg',
    filename: 'studio_shoot.jpg',
    size: 3456789,
    width: 1200,
    height: 1800,
    mimeType: 'image/jpeg',
    tags: ['studio', 'portrait'],
    category: 'photos',
    alt: 'Professional studio portrait',
    caption: 'New headshots!',
    order: 3,
    featured: true,
    creatorId: 'creator_002',
    creatorName: 'Marco Blaze',
    uploadedBy: 'admin',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Upload batches for tracking
let uploadBatches: UploadBatch[] = [];

// Get all gallery items
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { type, category, tags, featured, creatorId, page = 1, limit = 24 } = req.query;

    let filtered = [...galleryItems];

    if (type) {
      filtered = filtered.filter(i => i.type === type);
    }
    if (category) {
      filtered = filtered.filter(i => i.category === category);
    }
    if (tags) {
      const tagList = (tags as string).split(',');
      filtered = filtered.filter(i => tagList.some(t => i.tags.includes(t)));
    }
    if (featured === 'true') {
      filtered = filtered.filter(i => i.featured);
    }
    if (creatorId) {
      filtered = filtered.filter(i => i.creatorId === creatorId);
    }

    // Sort by order
    filtered.sort((a, b) => a.order - b.order);

    const total = filtered.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paged = filtered.slice(offset, offset + Number(limit));

    // Stats
    const stats = {
      total: galleryItems.length,
      images: galleryItems.filter(i => i.type === 'image').length,
      videos: galleryItems.filter(i => i.type === 'video').length,
      featured: galleryItems.filter(i => i.featured).length,
      totalSize: galleryItems.reduce((sum, i) => sum + i.size, 0)
    };

    res.json({
      success: true,
      items: paged,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Failed to get gallery items' });
  }
});

// Get single item
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const item = galleryItems.find(i => i.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to get item' });
  }
});

// Single file upload
router.post('/upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { tags, category, alt, caption, creatorId, creatorName, featured } = req.body;
    const isVideo = req.file.mimetype.startsWith('video/');

    const newItem: GalleryItem = {
      id: `gallery_${Date.now().toString(36)}`,
      type: isVideo ? 'video' : 'image',
      url: `https://cdn.fanz.website/gallery/${Date.now()}-${req.file.originalname}`,
      thumbnailUrl: `https://cdn.fanz.website/gallery/thumb/${Date.now()}-thumb.jpg`,
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
      category: category || (isVideo ? 'videos' : 'photos'),
      alt: alt || '',
      caption: caption || '',
      order: galleryItems.length + 1,
      featured: featured === 'true',
      creatorId,
      creatorName,
      uploadedBy: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    galleryItems.push(newItem);

    res.json({
      success: true,
      item: newItem
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Bulk upload
router.post('/upload/bulk', requireAdmin, upload.array('files', 50), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { tags, category, creatorId, creatorName } = req.body;

    // Create batch record
    const batch: UploadBatch = {
      id: `batch_${Date.now().toString(36)}`,
      status: 'processing',
      totalFiles: files.length,
      processedFiles: 0,
      failedFiles: 0,
      items: files.map(f => ({ filename: f.originalname, status: 'pending' })),
      startedAt: new Date().toISOString()
    };

    uploadBatches.push(batch);

    // Process files
    const uploadedItems: GalleryItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const isVideo = file.mimetype.startsWith('video/');

        const newItem: GalleryItem = {
          id: `gallery_${Date.now().toString(36)}_${i}`,
          type: isVideo ? 'video' : 'image',
          url: `https://cdn.fanz.website/gallery/${Date.now()}-${file.originalname}`,
          thumbnailUrl: `https://cdn.fanz.website/gallery/thumb/${Date.now()}-thumb.jpg`,
          filename: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
          category: category || (isVideo ? 'videos' : 'photos'),
          alt: '',
          caption: '',
          order: galleryItems.length + i + 1,
          featured: false,
          creatorId,
          creatorName,
          uploadedBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        galleryItems.push(newItem);
        uploadedItems.push(newItem);

        batch.items[i].status = 'completed';
        batch.items[i].itemId = newItem.id;
        batch.processedFiles++;
      } catch (err: any) {
        batch.items[i].status = 'failed';
        batch.items[i].error = err.message;
        batch.failedFiles++;
      }
    }

    batch.status = batch.failedFiles === batch.totalFiles ? 'failed' : 'completed';
    batch.completedAt = new Date().toISOString();

    res.json({
      success: true,
      batch,
      items: uploadedItems
    });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ error: 'Failed to process bulk upload' });
  }
});

// Get upload batch status
router.get('/batch/:id', requireAdmin, async (req, res) => {
  try {
    const batch = uploadBatches.find(b => b.id === req.params.id);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    res.json({
      success: true,
      batch
    });
  } catch (error) {
    console.error('Get batch error:', error);
    res.status(500).json({ error: 'Failed to get batch status' });
  }
});

// Update item metadata
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const item = galleryItems.find(i => i.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const { tags, category, alt, caption, featured, order } = req.body;

    if (tags) item.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
    if (category) item.category = category;
    if (alt !== undefined) item.alt = alt;
    if (caption !== undefined) item.caption = caption;
    if (featured !== undefined) item.featured = featured;
    if (order !== undefined) item.order = order;

    item.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Bulk update metadata
router.put('/bulk/update', requireAdmin, async (req, res) => {
  try {
    const { ids, tags, category, featured } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No item IDs provided' });
    }

    const updated: GalleryItem[] = [];

    for (const id of ids) {
      const item = galleryItems.find(i => i.id === id);
      if (item) {
        if (tags !== undefined) {
          item.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim());
        }
        if (category !== undefined) item.category = category;
        if (featured !== undefined) item.featured = featured;
        item.updatedAt = new Date().toISOString();
        updated.push(item);
      }
    }

    res.json({
      success: true,
      updated: updated.length,
      items: updated
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to bulk update items' });
  }
});

// Reorder items
router.put('/reorder', requireAdmin, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items data' });
    }

    for (const { id, order } of items) {
      const item = galleryItems.find(i => i.id === id);
      if (item) {
        item.order = order;
        item.updatedAt = new Date().toISOString();
      }
    }

    // Re-sort
    galleryItems.sort((a, b) => a.order - b.order);

    res.json({
      success: true,
      message: 'Items reordered'
    });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ error: 'Failed to reorder items' });
  }
});

// Delete item
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const index = galleryItems.findIndex(i => i.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    galleryItems.splice(index, 1);

    res.json({
      success: true,
      message: 'Item deleted'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Bulk delete
router.delete('/bulk/delete', requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No item IDs provided' });
    }

    let deleted = 0;
    for (const id of ids) {
      const index = galleryItems.findIndex(i => i.id === id);
      if (index !== -1) {
        galleryItems.splice(index, 1);
        deleted++;
      }
    }

    res.json({
      success: true,
      deleted
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Failed to bulk delete items' });
  }
});

// Get categories
router.get('/categories/list', requireAdmin, async (req, res) => {
  try {
    const categories = [...new Set(galleryItems.map(i => i.category).filter(Boolean))];

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get all tags
router.get('/tags/list', requireAdmin, async (req, res) => {
  try {
    const tagCounts: Record<string, number> = {};

    for (const item of galleryItems) {
      for (const tag of item.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    const tags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ error: 'Failed to get tags' });
  }
});

export default router;

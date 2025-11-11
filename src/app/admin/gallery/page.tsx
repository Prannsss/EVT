'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Trash2, Loader2, AlertCircle, Image as ImageIcon, Plus, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { API_URL } from '@/lib/utils';

interface GalleryItem {
  id: number;
  image_url: string;
  description: string | null;
  uploaded_at: string;
}

export default function AdminGalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  
  // Add form state
  const [newItem, setNewItem] = useState({
    description: ''
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check user role on mount
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserRole(user.role || 'unknown');
      } catch {
        setCurrentUserRole('invalid');
      }
    } else {
      setCurrentUserRole('none');
    }
    
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/gallery`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }

      const data = await response.json();
      setGalleryItems(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
    }
  };

  const handleAddGalleryItem = async () => {
    try {
      if (selectedFiles.length === 0) {
        alert('Please select at least one image');
        return;
      }

      const formData = new FormData();
      if (newItem.description) formData.append('description', newItem.description);
      
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        window.location.href = '/login';
        return;
      }

      // Debug: Check user role
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('Current user:', user);
        if (user.role !== 'admin') {
          alert('Admin access required. Your current role is: ' + user.role);
          return;
        }
      }

      const response = await fetch(`${API_URL}/api/gallery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message
        const errorMsg = data.message || 'Failed to upload images';
        console.error('Upload error:', { status: response.status, data });
        throw new Error(errorMsg);
      }

      alert('Images uploaded successfully!');
      setShowAddModal(false);
      setNewItem({ description: '' });
      setSelectedFiles([]);
      await fetchGalleryItems();
    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload images';
      alert(`Error: ${errorMessage}\n\nPlease check the console for more details.`);
    }
  };

  const handleDeleteItem = async (id: number) => {
    const confirmDelete = confirm('Are you sure you want to delete this gallery item? This action cannot be undone.');
    
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        window.location.href = '/login';
        return;
      }

      // Debug: Check user role
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          alert('Admin access required. Your current role is: ' + user.role);
          return;
        }
      }

      const response = await fetch(`${API_URL}/api/gallery/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Delete error:', { status: response.status, data });
        throw new Error(data.message || 'Failed to delete item');
      }

      alert('Gallery item deleted successfully!');
      await fetchGalleryItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      alert(`Error: ${errorMessage}\n\nPlease check the console for more details.`);
    }
  };

  // Parse images from gallery item
  const getImagesFromItem = (item: GalleryItem): string[] => {
    try {
      const parsedImages = JSON.parse(item.image_url);
      if (Array.isArray(parsedImages)) {
        return parsedImages.map(img => 
          img.startsWith('http') ? img : `${API_URL}${img}`
        );
      }
    } catch {
      // If not JSON, treat as single image
      if (item.image_url) {
        return [item.image_url.startsWith('http') ? item.image_url : `${API_URL}${item.image_url}`];
      }
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg text-muted-foreground">{error}</p>
        <Button onClick={fetchGalleryItems}>Try Again</Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Gallery Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your resort images with bento box layout
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* {currentUserRole && currentUserRole !== 'admin' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Current role: <strong>{currentUserRole}</strong> (Admin required)
              </span>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="ml-2"
              >
                Login as Admin
              </Button>
            </div>
          )}
          {currentUserRole === 'admin' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 rounded-lg border border-green-500/20">
              <span className="text-xs font-medium">✓ Admin Access</span>
            </div>
          )} */}
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="gap-2"
            // disabled={currentUserRole !== 'admin'}
          >
            <Plus className="w-4 h-4" />
            Add Gallery Item
          </Button>
        </div>
      </div>

      {galleryItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-lg">
          <ImageIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Gallery Items Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start building your gallery by uploading photos of your resort, accommodations, and amenities.
          </p>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Your First Images
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-4 grid-rows-3 gap-4 h-[800px]">
          {galleryItems.map((item, index) => {
            const images = getImagesFromItem(item);
            const imageUrl = images[0] || '/placeholder-room.svg';
            
            // Bento box grid layout pattern
            const getGridClass = (idx: number) => {
              const pattern = idx % 6;
              switch (pattern) {
                case 0: return "col-span-2 row-span-2"; // Large
                case 1: return "col-span-1 row-span-1"; // Small
                case 2: return "col-span-1 row-span-2"; // Tall
                case 3: return "col-span-2 row-span-1"; // Wide
                case 4: return "col-span-1 row-span-1"; // Small
                case 5: return "col-span-1 row-span-1"; // Small
                default: return "col-span-1 row-span-1";
              }
            };

            return (
              <Card 
                key={item.id} 
                className={`${getGridClass(index)} relative group overflow-hidden cursor-pointer hover:shadow-2xl transition-all border-2 hover:border-primary`}
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative w-full h-full bg-muted">
                  <Image 
                    src={imageUrl} 
                    alt={item.description || 'Gallery item'}
                    fill
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-room.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      {item.description && (
                        <p className="text-white text-sm mb-1 line-clamp-2">{item.description}</p>
                      )}
                      {images.length > 1 && (
                        <p className="text-white/80 text-sm flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          {images.length} images
                        </p>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Gallery Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="w-5 h-5 text-primary" />
              Add Gallery Item
            </DialogTitle>
            <DialogDescription>
              Upload multiple images to create a gallery collection
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="description" className="text-sm font-semibold">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Describe this gallery collection..."
                className="min-h-[100px] resize-none mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Images (Multiple)</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
                aria-label="Upload gallery images"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                {selectedFiles.length > 0 ? (
                  <>
                    <p className="text-sm text-primary font-medium">
                      {selectedFiles.length} image{selectedFiles.length > 1 ? 's' : ''} selected
                    </p>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx}>{file.name}</div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Click to change images
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Click to upload images (multiple)
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum 10 images per collection
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowAddModal(false);
                setNewItem({ description: '' });
                setSelectedFiles([]);
              }}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleAddGalleryItem} className="gap-2">
              <Upload className="w-4 h-4" />
              Upload Images
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Gallery Item Modal */}
      {selectedItem && (() => {
        const images = getImagesFromItem(selectedItem);
        
        return (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Gallery Item
                </DialogTitle>
                {selectedItem.description && (
                  <DialogDescription>{selectedItem.description}</DialogDescription>
                )}
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 mt-4">
                {images.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border-2 bg-muted">
                    <Image
                      src={url}
                      alt={`Gallery - ${idx + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-room.svg';
                      }}
                    />
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </>
  );
}

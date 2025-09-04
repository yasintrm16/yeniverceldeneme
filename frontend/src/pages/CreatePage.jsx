import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react"; // useEffect'i import et
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";

const CreatePage = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // YENİ: Resim önizlemesi için state
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // --- GÜNCELLENMİŞ FONKSİYON ---
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setImage(null);
            setPreviewUrl(null); // GÜNCELLENDİ: Dosya seçimi iptal edilirse önizlemeyi temizle
            return;
        }

        const MAX_FILE_SIZE_MB = 5;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error(`Dosya boyutu çok büyük! Lütfen ${MAX_FILE_SIZE_MB}MB'dan küçük bir fotoğraf seçin.`);
            e.target.value = null;
            setImage(null);
            setPreviewUrl(null); // GÜNCELLENDİ: Hatalı dosyada önizlemeyi temizle
            return;
        }

        setImage(file);
        setPreviewUrl(URL.createObjectURL(file)); // GÜNCELLENDİ: Geçerli dosya için önizleme URL'si oluştur
    };

    // YENİ: Bellek sızıntılarını önlemek için cleanup etkisi
    // Bir önizleme URL'si oluşturulduğunda, component'tan ayrılırken bu URL'yi bellekten temizlemek en iyi pratiktir.
    useEffect(() => {
        // Component unmount olduğunda (sayfadan ayrıldığında) bu fonksiyon çalışır
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]); // Bu effect, sadece previewUrl değiştiğinde çalışır


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast.error("All fields are required");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (image) {
            formData.append("image", image);
        }

        try {
            await api.post("/notes", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success("Note created successfully!");
            navigate("/");
        } catch (error) {
            console.log("Error creating note", error);
            if (error.response?.status === 429) {
                toast.error("Slow down! You're creating notes too fast", {
                    duration: 4000,
                    icon: "💀",
                });
            } else {
                toast.error(error.response?.data?.message || "Failed to create note");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Link to={"/"} className="btn btn-ghost mb-6">
                        <ArrowLeftIcon className="size-5" />
                        Back to Notes
                    </Link>

                    <div className="card bg-base-100">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4">Create New Note</h2>
                            <form onSubmit={handleSubmit}>
                                {/* ...diğer form elemanları... */}
                                
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Image (Max 5MB)</span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="file-input file-input-bordered w-full"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                {/* YENİ: Resim Önizleme Alanı */}
                                {previewUrl && (
                                    <div className='mb-4'>
                                        <label className="label">
                                            <span className="label-text">Image Preview</span>
                                        </label>
                                        <img 
                                            src={previewUrl} 
                                            alt="Selected preview" 
                                            className="w-full h-auto max-h-80 object-cover rounded-lg border border-base-300" 
                                        />
                                    </div>
                                )}
                                {/* Bitiş: Resim Önizleme Alanı */}

                                <div className="card-actions justify-end">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? "Creating..." : "Create Note"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CreatePage;
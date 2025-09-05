import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { ArrowLeftIcon, LoaderIcon, Trash2Icon } from "lucide-react";

const NoteDetailPage = () => {
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newImage, setNewImage] = useState(null);
    const [newImagePreview, setNewImagePreview] = useState(null); // YENİ: Yeni resmin önizlemesi için state

    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const res = await api.get(`/notes/${id}`);
                setNote(res.data);
            } catch (error) {
                console.log("Error in fetching note", error);
                toast.error("Failed to fetch the note");
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [id]);

    // YENİ: Bellek sızıntılarını önlemek için cleanup etkisi
    useEffect(() => {
        return () => {
            if (newImagePreview) {
                URL.revokeObjectURL(newImagePreview);
            }
        };
    }, [newImagePreview]);


    // YENİ: Dosya seçildiğinde boyutu anında kontrol eden fonksiyon
    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setNewImage(null);
            setNewImagePreview(null);
            return;
        }

        const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

        if (file.size > MAX_FILE_SIZE_BYTES) {
            // İstenen hata mesajı ile kullanıcıyı anında uyar
            toast.error("fotoğraf çok buyuk");
            
            e.target.value = null; // Dosya girişini temizle
            setNewImage(null);
            setNewImagePreview(null);
            return;
        }

        // Dosya geçerliyse state'leri güncelle
        setNewImage(file);
        setNewImagePreview(URL.createObjectURL(file));
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this note?")) return;

        try {
            await api.delete(`/notes/${id}`);
            toast.success("Note deleted");
            navigate("/");
        } catch (error) {
            console.log("Error deleting the note:", error);
            toast.error("Failed to delete note");
        }
    };

    const handleSave = async () => {
        if (!note.title.trim() || !note.content.trim()) {
            toast.error("Please add a title or content");
            return;
        }

        setSaving(true);
        const formData = new FormData();
        formData.append("title", note.title);
        formData.append("content", note.content);
        formData.append("subtitle", note.subtitle);
        if (newImage) {
            formData.append("image", newImage);
        }

        try {
            await api.put(`/notes/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Note updated successfully");
            navigate("/");
        } catch (error) {
            console.log("Error saving the note:", error);
            // Backend'den gelebilecek dosya boyutu hatasını da yakala
            toast.error(error.response?.data?.message || "Failed to update note");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <LoaderIcon className="animate-spin size-10" />
            </div>
        );
    }

    if (!note) return null;

    const imageUrl = note.image ? note.image.url : null;

    return (
        <div className="min-h-screen bg-base-200">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <Link to="/" className="btn btn-ghost"> <ArrowLeftIcon className="h-5 w-5" /> Back to Notes </Link>
                        <button onClick={handleDelete} className="btn btn-error btn-outline"> <Trash2Icon className="h-5 w-5" /> Delete Note </button>
                    </div>

                    <div className="card bg-base-100">
                        <div className="card-body">
                            {/* GÜNCELLENDİ: Resim gösterme mantığı */}
                            {/* Önce yeni resim önizlemesini, o yoksa mevcut not resmini göster */}
                            {newImagePreview ? (
                                <img src={newImagePreview} alt="New preview" className="w-full h-auto object-cover rounded-lg mb-4" />
                            ) : imageUrl && (
                                <img src={imageUrl} alt={note.title} className="w-full h-auto object-cover rounded-lg mb-4" />
                            )}

                            {/* Title input */}
                            <div className="form-control mb-4">
                                <label className="label"><span className="label-text">Title</span></label>
                                <input type="text" placeholder="Note title" className="input input-bordered" value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} />
                            </div>

                            {/* Content input */}
                            <div className="form-control mb-4">
                                <label className="label"><span className="label-text">Content</span></label>
                                <textarea placeholder="Write your note here..." className="textarea textarea-bordered h-32" value={note.content} onChange={(e) => setNote({ ...note, content: e.target.value })} />
                            </div>
                            <div className="form-control mb-4">
                                <label className="label"><span className="label-text">subtitle</span></label>
                                <textarea placeholder="Write your note here..." className="textarea textarea-bordered h-32" value={note.subtitle} onChange={(e) => setNote({ ...note, subtitle: e.target.value })} />
                            </div>

                            {/* GÜNCELLENDİ: Dosya input'u yeni fonksiyonu kullanıyor */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text">Change Image (Max 5MB)</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="file-input file-input-bordered w-full"
                                    onChange={handleImageChange} // onChange olayını yeni fonksiyona bağladık
                                />
                            </div>

                            <div className="card-actions justify-end">
                                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NoteDetailPage;
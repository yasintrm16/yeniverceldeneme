import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";

const CreatePage = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setImage(null);
            setPreviewUrl(null);
            return;
        }

        const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE_BYTES) {
            toast.error("fotoğraf çok buyuk");
            e.target.value = null;
            setImage(null);
            setPreviewUrl(null);
            return;
        }

        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

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
                headers: { "Content-Type": "multipart-form-data" },
            });
            toast.success("Note created successfully!");
            navigate("/");
        } catch (error) {
            console.log("Error creating note", error);
            toast.error(error.response?.data?.message || "Failed to create note");
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
                                {/* EKLENMESİ GEREKEN BÖLÜM 1: Title Input */}
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Title</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Note title"
                                        className="input input-bordered w-full"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                {/* EKLENMESİ GEREKEN BÖLÜM 2: Content Textarea */}
                                <div className="form-control mb-4">
                                    <label className="label">
                                        <span className="label-text">Content</span>
                                    </label>
                                    <textarea
                                        placeholder="Write your note here..."
                                        className="textarea textarea-bordered w-full h-32"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                    />
                                </div>
                                
                                {/* Fotoğraf yükleme alanı */}
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
                                
                                {/* Resim Önizleme Alanı */}
                                {previewUrl && (
                                    <div className='mb-4'>
                                        <label className="label"><span className="label-text">Image Preview</span></label>
                                        <img src={previewUrl} alt="Selected preview" className="w-full h-auto max-h-80 object-cover rounded-lg" />
                                    </div>
                                )}

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
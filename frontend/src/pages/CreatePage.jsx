// frontend/src/pages/CreatePage.jsx

import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/axios";

const CreatePage = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) {
            setImage(null);
            return;
        }

        const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

        // Dosya boyutunu anında kontrol et
        if (file.size > MAX_FILE_SIZE_BYTES) {
            // DEĞİŞİKLİK BURADA: Hata mesajını güncelledik.
            toast.error("fotoğraf çok buyuk"); 
            
            e.target.value = null; 
            setImage(null);
            return; // İşlemi burada durdurarak "Kaydet" tuşuna basılmasını bekleme
        }

        setImage(file);
    };

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
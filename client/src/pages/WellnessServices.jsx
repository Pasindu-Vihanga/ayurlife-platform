import { useState, useEffect } from 'react';
import api, { BASE_URL } from '../services/api';
import { Plus, Edit, Trash2, Leaf, Clock, Hash, Tag, ArrowLeft, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WellnessServices = () => {
    const [therapies, setTherapies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        durationMinutes: '',
        price: '',
        category: 'Massage',
        image: '',
        requiredRooms: ''
    });

    const navigate = useNavigate();

    const categories = ['Massage', 'Consultation', 'Detox', 'Yoga', 'Acupuncture', 'Other'];

    useEffect(() => {
        fetchTherapies();
    }, []);

    const fetchTherapies = async () => {
        try {
            const { data } = await api.get('/wellness/therapies');
            setTherapies(data);
        } catch (error) {
            console.error('Error fetching therapies', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (therapy) => {
        setEditingId(therapy._id);
        setFormData({
            name: therapy.name,
            description: therapy.description,
            durationMinutes: therapy.durationMinutes,
            price: therapy.price,
            category: therapy.category || 'Massage',
            image: therapy.image || '',
            requiredRooms: Array.isArray(therapy.requiredRooms) ? therapy.requiredRooms.join(', ') : ''
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this therapy service? This action cannot be undone.')) {
            try {
                await api.delete(`/wellness/therapies/${id}`);
                alert('Therapy removed successfully');
                fetchTherapies();
            } catch (error) {
                console.error('Error deleting therapy', error);
                alert('Failed to delete therapy');
            }
        }
    };

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        setUploading(true);

        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };
            const { data } = await api.post('/upload', formDataUpload, config);
            setFormData(prev => ({ ...prev, image: data.image }));
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                requiredRooms: formData.requiredRooms ? formData.requiredRooms.split(',').map(r => r.trim()) : []
            };

            if (editingId) {
                await api.put(`/wellness/therapies/${editingId}`, payload);
                alert('Therapy updated successfully');
            } else {
                await api.post('/wellness/therapies', payload);
                alert('New therapy service added');
            }

            setShowForm(false);
            setEditingId(null);
            setFormData({ name: '', description: '', durationMinutes: '', price: '', category: 'Massage', image: '', requiredRooms: '' });
            fetchTherapies();
        } catch (error) {
            console.error('Error saving therapy', error);
            alert('Failed to save therapy');
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400 hover:text-primary transition-all"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black text-primary tracking-tight">Therapy Services</h1>
                        <p className="text-muted font-bold mt-1 uppercase tracking-widest text-[10px]">Manage Rejuvenation Portfolio</p>
                    </div>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center space-x-3 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={18} />
                        <span>Add New Therapy</span>
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                                <Leaf size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">{editingId ? 'Update Service' : 'Add New Service'}</h2>
                        </div>
                        <button onClick={() => { setShowForm(false); setEditingId(null); setFormData({ name: '', description: '', durationMinutes: '', price: '', category: 'Massage', image: '', requiredRooms: '' }); }} className="text-[10px] font-black uppercase text-muted hover:text-red-500 tracking-widest">Cancel</button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-1">
                                <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Therapy Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="block w-full bg-gray-50 border-none rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                                    placeholder="e.g. Traditional Ayurvedic Shirodhara"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Category</label>
                                <div className="relative">
                                    <LayoutGrid size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="block w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Duration (Minutes)</label>
                                <div className="relative">
                                    <Clock size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="number"
                                        required
                                        value={formData.durationMinutes}
                                        onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                        className="block w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                                        placeholder="60"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Price (LKR)</label>
                                <div className="relative">
                                    <Tag size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="block w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                                        placeholder="5500"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Service Image</label>
                                <div className="relative">
                                    <input type="file" id="therapy-image" className="hidden" onChange={uploadFileHandler} />
                                    <label htmlFor="therapy-image" className="block w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-3.5 px-6 text-[10px] font-black uppercase tracking-widest text-center cursor-pointer hover:bg-gray-100 transition-all text-muted">
                                        {uploading ? 'Uploading...' : formData.image ? 'Change Image' : 'Select Image'}
                                    </label>
                                    {formData.image && (
                                        <div className="mt-2 flex items-center space-x-3 p-2 bg-green-50 rounded-xl border border-green-100">
                                            <div className="h-8 w-8 rounded-lg overflow-hidden bg-white shadow-sm">
                                                <img src={formData.image.startsWith('/uploads') ? `${BASE_URL}${formData.image}` : formData.image} alt="Preview" className="h-full w-full object-cover" />
                                            </div>
                                            <span className="text-[9px] font-bold text-green-700 truncate flex-1">{formData.image.split('/').pop()}</span>
                                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, image: '' }))} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="lg:col-span-2 space-y-1">
                                <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Required Facilities (Comma separated)</label>
                                <div className="relative">
                                    <Hash size={16} className="absolute left-6 top-4 text-gray-300" />
                                    <input
                                        type="text"
                                        value={formData.requiredRooms}
                                        onChange={(e) => setFormData({ ...formData, requiredRooms: e.target.value })}
                                        className="block w-full bg-gray-50 border-none rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300"
                                        placeholder="Massage Bed, Steam Box, Oil Fountain..."
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3 space-y-1">
                                <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-1">Detailed Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="block w-full bg-gray-50 border-none rounded-2xl py-5 px-6 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-gray-300 leading-relaxed"
                                    placeholder="Explain the process and healing benefits of this therapy..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="submit" disabled={uploading} className="px-12 py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                                {editingId ? 'Update Service' : 'Activate Service'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {therapies.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center space-y-4">
                        <Leaf size={48} className="text-gray-100" />
                        <p className="text-muted font-bold">No therapy services have been added yet.</p>
                    </div>
                ) : (
                    therapies.map(t => (
                        <div key={t._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/10 transition-all group flex flex-col h-full">
                            <div className="h-56 relative overflow-hidden">
                                {t.image ? (
                                    <img src={t.image.startsWith('/uploads') ? `${BASE_URL}${t.image}` : t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary/20">
                                        <Leaf size={64} />
                                    </div>
                                )}
                                <div className="absolute top-6 left-6 flex items-center space-x-2">
                                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                                        {t.category || 'General'}
                                    </span>
                                </div>
                                <div className="absolute top-6 right-6 flex space-x-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <button
                                        onClick={() => handleEdit(t)}
                                        className="p-3 bg-white/90 backdrop-blur-md text-gray-600 hover:text-primary rounded-xl shadow-xl transition-all"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t._id)}
                                        className="p-3 bg-white/90 backdrop-blur-md text-gray-600 hover:text-red-500 rounded-xl shadow-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">{t.name}</h3>
                                    <p className="text-xs text-muted font-bold leading-relaxed line-clamp-3 mb-6">{t.description}</p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <Clock size={14} className="text-primary" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t.durationMinutes} Mins</span>
                                            </div>
                                        </div>
                                        <div className="text-lg font-black text-primary tracking-tight">
                                            <span className="text-[10px] uppercase text-muted mr-1">LKR</span>{t.price}
                                        </div>
                                    </div>

                                    {t.requiredRooms && t.requiredRooms.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {t.requiredRooms.map((room, idx) => (
                                                <span key={idx} className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-lg">
                                                    {room}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WellnessServices;

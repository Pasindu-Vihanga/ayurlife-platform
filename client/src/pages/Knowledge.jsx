import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import { BookOpen, Leaf, Sparkles, ChevronLeft, UserCircle, Search, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Knowledge = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchKnowledge = async () => {
            try {
                const { data } = await api.get('/knowledge');
                setArticles(data);
            } catch (error) {
                console.error('Error fetching knowledge:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchKnowledge();
    }, []);

    const filteredArticles = articles.filter(article => 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <Layout>
            <div className="flex items-center justify-center min-h-[50vh]">
                 <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                </div>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <Link to="/dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <ChevronLeft size={20} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-gray-900">Wisdom & Knowledge</h1>
                            <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Ancient Ayurvedic Cures</p>
                        </div>
                    </div>
                    
                    <div className="relative w-full md:w-72">
                        <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search articles..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:border-emerald-400/30 focus:ring-4 focus:ring-emerald-400/5 transition-all outline-none shadow-sm"
                        />
                    </div>
                </div>

                {filteredArticles.length === 0 ? (
                    <div className="text-center py-20 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100/50 shadow-sm">
                        <BookOpen size={48} className="mx-auto text-emerald-200/60 mb-4" />
                        <p className="text-emerald-700 font-bold italic">No articles found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {filteredArticles.map((article) => (
                            <div key={article._id} className="group bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 flex flex-col md:flex-row shadow-sm h-full">
                                <div className="relative md:w-2/5 md:h-auto h-48 bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center transition-colors group-hover:from-emerald-100/50 group-hover:to-teal-100/50 border-r border-gray-50/50">
                                    {article.category === 'Plants' ? <Leaf size={48} className="text-emerald-500 opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500" /> : <Sparkles size={48} className="text-teal-500 opacity-60 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500" />}
                                    <div className="absolute top-6 left-6 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[9px] font-black uppercase tracking-widest text-emerald-600 shadow-sm border border-emerald-100/50">
                                        {article.category}
                                    </div>
                                </div>
                                <div className="p-8 md:p-10 flex-1 flex flex-col space-y-4">
                                    <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors tracking-tight">{article.title}</h3>
                                    <p className="text-xl font - redtext-sm font-medium flex-1 whitespace-pre-line leading-relaxed">
                                        {article.content}
                                    </p>
                                    <div className="pt-6 border-t border-gray-100/50 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                                <UserCircle size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Dr. {article.author?.user?.name || 'Ayurvedic Expert'}</span>
                                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Verified Author</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Knowledge;

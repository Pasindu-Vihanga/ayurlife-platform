import { useState, useEffect } from 'react';
import api, { BASE_URL } from '../services/api';
import { ShoppingBag, Leaf, Tag, Search, X, ArrowRight, Star, ShoppingCart, Plus, Minus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

const HerbShop = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Cart State
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const [showCheckout, setShowCheckout] = useState(false);
    const [shippingData, setShippingData] = useState({
        shippingAddress: '',
        city: '',
        postalCode: '',
        phoneNumber: '',
        paymentMethod: 'Cash on Delivery'
    });

    // Request Product State
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestData, setRequestData] = useState({ productName: '', details: '' });
    const [toast, setToast] = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/requests', requestData);
            showToast('Request submitted! We will notify you when it becomes available.');
            setShowRequestModal(false);
            setRequestData({ productName: '', details: '' });
        } catch (error) {
            console.error('Error submitting request', error);
            showToast('Failed to submit request. Please try again.');
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const { data } = await api.get('/inventory');
            setInventory(data);
        } catch (error) {
            console.error('Error fetching herb inventory', error);
        } finally {
            setLoading(false);
        }
    };

    // --- Cart Functions ---

    const addToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(i => i._id === item._id);
            if (existingItem) {
                return prevCart.map(i =>
                    i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (itemId) => {
        setCart(prevCart => prevCart.filter(i => i._id !== itemId));
    };

    const updateQuantity = (itemId, delta) => {
        setCart(prevCart => prevCart.map(item => {
            if (item._id === itemId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((total, item) => total + (item.pricePerUnit * item.quantity), 0);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        // Group items by Supplier
        const ordersBySupplier = cart.reduce((acc, item) => {
            const supplierId = item.supplier?._id || item.supplier; // Handle populated or ID
            if (!acc[supplierId]) {
                acc[supplierId] = {
                    supplier: supplierId,
                    items: [],
                    totalAmount: 0
                };
            }
            acc[supplierId].items.push({
                inventoryItem: item._id,
                name: item.name,
                quantity: item.quantity,
                price: item.pricePerUnit
            });
            acc[supplierId].totalAmount += (item.pricePerUnit * item.quantity);
            return acc;
        }, {});

        try {
            const orderPromises = Object.values(ordersBySupplier).map(orderData =>
                api.post('/orders', {
                    ...orderData,
                    ...shippingData
                })
            );

            await Promise.all(orderPromises);

            showToast(`Orders placed! Expect packages from ${Object.keys(ordersBySupplier).length} supplier(s).`);
            setCart([]);
            setShowCheckout(false);
            fetchInventory();
        } catch (error) {
            console.error('Error placing order', error);
            showToast('Failed to place some orders. Please try again.');
        }
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
        return matchesSearch && matchesCategory && item.stock > 0;
    });

    if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 relative">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 z-[200] flex items-center gap-3 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-200 animate-in slide-in-from-right">
                    <CheckCircle2 size={18} /> <span className="text-sm font-bold">{toast}</span>
                </div>
            )}

            {/* Cart Floating Button */}
            <button
                onClick={() => setIsCartOpen(true)}
                className="fixed bottom-8 right-8 z-40 bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center border-4 border-white"
            >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                        {cart.reduce((a, c) => a + c.quantity, 0)}
                    </span>
                )}
            </button>

            {/* Cart Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div>
                            <h2 className="text-xl font-black text-gray-900">Your Cart</h2>
                            <p className="text-xs text-muted font-bold uppercase tracking-widest">{cart.length} Items</p>
                        </div>
                        <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="text-center py-20 opacity-50">
                                <ShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="font-bold text-gray-500">Your cart is empty</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item._id} className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image.startsWith('/uploads') ? `${BASE_URL}${item.image}` : item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : <div className="w-full h-full flex items-center justify-center"><Leaf size={20} className="text-gray-400" /></div>}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.name}</h4>
                                        <p className="text-xs text-primary font-black mt-1">LKR {item.pricePerUnit}</p>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                                                <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-white rounded-md transition-colors"><Minus size={12} /></button>
                                                <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Plus size={12} /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item._id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-sm font-bold text-gray-500">Total Amount</span>
                            <span className="text-xl font-black text-primary">LKR {cartTotal.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={() => { setIsCartOpen(false); setShowCheckout(true); }}
                            disabled={cart.length === 0}
                            className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative rounded-[2.5rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.15),_transparent_70%)]"></div>
                <div className="absolute -right-10 -bottom-20 opacity-10">
                    <Leaf size={300} />
                </div>
                <div className="relative z-10 p-10 md:p-14">
                    <span className="inline-flex items-center gap-2 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
                        <Leaf size={10} /> AyurLife Verified Suppliers
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                        Nature's Finest <br />
                        <span className="text-white/80">Medicine Cabinet</span>
                    </h1>
                    <p className="text-white/70 font-medium max-w-xl leading-relaxed mb-8">
                        Source premium quality raw herbs, essential oils, and organic ingredients directly from certified growers.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => document.getElementById('shop-section').scrollIntoView({ behavior: 'smooth' })} className="px-7 py-3.5 bg-white text-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-2 group">
                            <span>Explore Collection</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <div className="px-7 py-3.5 rounded-2xl border border-white/20 backdrop-blur-sm flex items-center gap-2">
                            <Star className="text-yellow-300 fill-yellow-300" size={16} />
                            <span className="font-bold text-sm text-white">Top Rated Suppliers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div id="shop-section" className="sticky top-4 z-30 bg-white/80 backdrop-blur-xl p-4 rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-100/50 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 bg-gray-50 rounded-2xl px-2 py-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
                    {['All', 'Raw Herb', 'Processed', 'Oil'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${categoryFilter === cat
                                ? 'bg-white text-primary shadow-md shadow-gray-200 ring-1 ring-black/5'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-96 group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for herbs, roots, oils..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none placeholder:font-normal placeholder:text-gray-400"
                    />
                </div>
                <button
                    onClick={() => setShowRequestModal(true)}
                    className="p-4 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition-colors flex items-center space-x-2 text-xs font-black uppercase tracking-widest whitespace-nowrap"
                >
                    <AlertCircle size={16} />
                    <span>Can't find item?</span>
                </button>
            </div>

            {/* Product Grid */}
            {filteredInventory.length === 0 ? (
                <div className="text-center py-32 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                    <Leaf className="mx-auto h-16 w-16 text-gray-300 mb-6" />
                    <h3 className="text-xl font-bold text-gray-900">No items found</h3>
                    <p className="text-muted font-medium mt-2">Try adjusting your filters or search terms</p>
                    <button
                        onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
                        className="mt-6 text-primary font-bold text-sm hover:underline"
                    >
                        Clear all filters
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredInventory.map((item) => (
                        <div key={item._id} className="group bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 flex flex-col h-full">
                            {/* Image Container */}
                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-gray-100 mb-6">
                                {item.image ? (
                                    <img
                                        src={item.image.startsWith('/uploads') ? `${BASE_URL}${item.image}` : item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                        <Leaf size={48} />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-primary shadow-sm border border-gray-100">
                                        {item.category}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="px-2 flex-grow flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-black text-primary">LKR {item.pricePerUnit}</span>
                                        <span className="text-[9px] font-bold text-muted uppercase tracking-widest">Per {item.unit}</span>
                                    </div>
                                </div>

                                <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-4 flex items-center space-x-1">
                                    <Tag size={10} />
                                    <span>{item.scientificName || 'Premium Quality'}</span>
                                </p>

                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <span className={`text-[10px] font-black uppercase tracking-widest flex items-center ${item.stock < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${item.stock < 10 ? 'bg-red-500 animate-pulse' : 'bg-green-600'}`}></div>
                                        {item.stock} {item.unit} in stock
                                    </span>

                                    <button
                                        onClick={() => addToCart(item)}
                                        className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm group-hover:shadow-md"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Checkout Modal - Cart Version */}
            {showCheckout && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowCheckout(false)}></div>
                    <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-8 pb-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Checkout</h2>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Complete your purchase</p>
                            </div>
                            <button onClick={() => setShowCheckout(false)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-8 pt-6">
                            {/* Order Summary */}
                            <div className="space-y-4 mb-8">
                                {cart.map(item => (
                                    <div key={item._id} className="bg-gray-50 rounded-[2rem] p-4 border border-gray-100 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image.startsWith('/uploads') ? `${BASE_URL}${item.image}` : item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : <div className="flex items-center justify-center h-full"><Leaf size={20} className="text-gray-300" /></div>}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                                            <p className="text-xs text-muted">{item.quantity} x LKR {item.pricePerUnit}</p>
                                        </div>
                                        <div className="font-black text-primary">
                                            LKR {(item.quantity * item.pricePerUnit).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 px-2">
                                    <span className="font-bold text-gray-900">Total Payable</span>
                                    <span className="text-xl font-black text-primary">LKR {cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <form onSubmit={handlePlaceOrder} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2">Delivery Address</label>
                                    <textarea
                                        required
                                        value={shippingData.shippingAddress}
                                        onChange={(e) => setShippingData({ ...shippingData, shippingAddress: e.target.value })}
                                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none min-h-[100px] resize-none placeholder:font-normal placeholder:text-gray-300"
                                        placeholder="Street Address, Apt/Suite..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2">City</label>
                                        <input
                                            type="text" required
                                            value={shippingData.city}
                                            onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:font-normal placeholder:text-gray-300"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2">Postal Code</label>
                                        <input
                                            type="text" required
                                            value={shippingData.postalCode}
                                            onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                                            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:font-normal placeholder:text-gray-300"
                                            placeholder="ZIP Code"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-muted uppercase tracking-widest px-2">Contact Number</label>
                                    <input
                                        type="tel" required
                                        value={shippingData.phoneNumber}
                                        onChange={(e) => setShippingData({ ...shippingData, phoneNumber: e.target.value })}
                                        className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold text-gray-900 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none placeholder:font-normal placeholder:text-gray-300"
                                        placeholder="+94 7X XXX XXXX"
                                    />
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full py-5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-[2rem] shadow-xl shadow-green-600/30 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-3 group"
                                    >
                                        <ShoppingBag size={20} className="group-hover:rotate-12 transition-transform" />
                                        <span>Confirm Order - Cash on Delivery</span>
                                    </button>
                                    <p className="text-center mt-4 text-[10px] font-bold text-muted uppercase tracking-widest">
                                        Secure Transaction • Trusted Suppliers
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Product Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowRequestModal(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Request Item</h2>
                                <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-1">Let us know what you need</p>
                            </div>
                            <button onClick={() => setShowRequestModal(false)} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-all text-gray-500 hover:text-red-500">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleRequestSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Medicine / Herb Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Ashwagandha Root"
                                    value={requestData.productName}
                                    onChange={(e) => setRequestData({ ...requestData, productName: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted px-2">Additional Details (Optional)</label>
                                <textarea
                                    placeholder="Quantity needed, brand preference, etc."
                                    rows="3"
                                    value={requestData.details}
                                    onChange={(e) => setRequestData({ ...requestData, details: e.target.value })}
                                    className="w-full p-4 rounded-2xl bg-gray-50 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                ></textarea>
                            </div>

                            <button type="submit" className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center space-x-2">
                                <AlertCircle size={16} />
                                <span>Submit Request</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HerbShop;

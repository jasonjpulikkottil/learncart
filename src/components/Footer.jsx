import { Github, Heart, Facebook, Twitter, Instagram, BookOpen, Monitor, Sofa, Shirt } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-xl font-bold text-white mb-4">LearnCart</h3>
                        <p className="text-sm leading-relaxed">
                            The student marketplace for buying, selling, and swapping textbooks,
                            electronics, furniture, and more. Save money, reduce waste, connect with peers.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/listings" className="hover:text-white transition">
                                    Browse Listings
                                </Link>
                            </li>
                            <li>
                                <Link href="/listings/new" className="hover:text-white transition">
                                    Sell an Item
                                </Link>
                            </li>
                            <li>
                                <Link href="/listings?swappable=true" className="hover:text-white transition">
                                    Swap Items
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/listings?category=textbooks" className="hover:text-white transition">
                                    <BookOpen className="w-4 h-4 inline mr-1" /> Textbooks
                                </Link>
                            </li>
                            <li>
                                <Link href="/listings?category=electronics" className="hover:text-white transition">
                                    <Monitor className="w-4 h-4 inline mr-1" /> Electronics
                                </Link>
                            </li>
                            <li>
                                <Link href="/listings?category=furniture" className="hover:text-white transition">
                                    <Sofa className="w-4 h-4 inline mr-1" /> Furniture
                                </Link>
                            </li>
                            <li>
                                <Link href="/listings?category=clothing" className="hover:text-white transition">
                                    <Shirt className="w-4 h-4 inline mr-1" /> Clothing
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm flex items-center gap-1">
                        Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for students
                    </p>
                    <p className="text-sm">
                        © {new Date().getFullYear()} LearnCart. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}

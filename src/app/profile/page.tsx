"use client";

import { ChevronLeft, User, Bell, HelpCircle, Lock, Download, Sun, ChevronRight, LogOut, Info, Scale, Shield } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-white pb-24 pt-12">
            {/* Header */}
            <div className="mb-6 flex items-center px-6">
                <Link href="/home" className="mr-4 text-gray-900 hover:text-gray-600">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="px-6 space-y-8">

                {/* Account Section */}
                <section>
                    <h2 className="mb-4 text-lg font-bold text-gray-900">Account</h2>
                    <div className="space-y-6">
                        <SettingItem icon={User} title="Account Information" subtitle="Name, email, and profile details" />
                        <SettingItem icon={Lock} title="Change Password" />
                        <SettingItem icon={Download} title="Export My Data" subtitle="Download all your activity logs and journal entries" />
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* Preferences Section */}
                <section>
                    <h2 className="mb-4 text-lg font-bold text-gray-900">Preferences</h2>
                    <div className="space-y-6">
                        {/* Dark Mode Toggle */}
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500">
                                <Sun size={24} strokeWidth={1.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-semibold text-gray-900">Dark Mode</h3>
                                <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                            </div>
                            <div className="relative h-6 w-11 cursor-pointer rounded-full bg-gray-200">
                                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm"></div>
                            </div>
                        </div>

                        <SettingItem icon={Bell} title="Notifications" />
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* About Section */}
                <section>
                    <h2 className="mb-4 text-lg font-bold text-gray-900">About</h2>
                    <div className="space-y-6">
                        <SettingItem icon={Info} title="About Momentum Daily" />
                        <SettingItem icon={Shield} title="Privacy Policy" />
                        <SettingItem icon={Scale} title="Terms of Service" />
                    </div>
                </section>

                {/* Logout */}
                <div className="pt-4 pb-8">
                    <button className="flex items-center gap-3 text-red-500 hover:text-red-600">
                        <LogOut size={24} />
                        <span className="text-base font-semibold">Logout</span>
                    </button>
                </div>

            </div>
        </div>
    );
}

function SettingItem({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) {
    return (
        <div className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 group-hover:text-gray-900">
                    <Icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500 max-w-[240px] leading-tight">{subtitle}</p>}
                </div>
            </div>
            <ChevronRight size={20} className="text-gray-300" />
        </div>
    )
}

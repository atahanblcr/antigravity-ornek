"use client"

import { Truck, ShieldCheck, Headphones, Clock, CreditCard, Sparkles } from "lucide-react"

/**
 * Hizmetler Bölümü
 * Premium kart tasarımı ile işletmenin sunduğu hizmetler/avantajlar
 */
export function ServicesSection() {
    const services = [
        {
            icon: Truck,
            title: "Hızlı Teslimat",
            description: "Siparişleriniz özenle hazırlanır ve en kısa sürede kargoya verilir.",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: ShieldCheck,
            title: "Güvenli Alışveriş",
            description: "256-bit SSL sertifikası ile ödemeleriniz %100 güvence altındadır.",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            icon: Headphones,
            title: "7/24 Destek",
            description: "Satış öncesi ve sonrası sorularınız için dilediğiniz zaman bize ulaşın.",
            gradient: "from-amber-500 to-orange-500"
        },
        {
            icon: Sparkles,
            title: "Orijinal Ürün",
            description: "Tüm ürünlerimiz %100 orijinal ve garantili olarak tarafınıza ulaşır.",
            gradient: "from-emerald-500 to-green-500"
        }
    ]

    return (
        <section id="services" className="py-24 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 -z-20" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

            <div className="container px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                        <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Hizmetlerimiz
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Müşteri memnuniyetini en üst düzeyde tutmak için sunduğumuz ayrıcalıklar.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, idx) => (
                        <div
                            key={idx}
                            className="group relative p-8 rounded-3xl bg-white border border-white/20 shadow-lg shadow-black/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                        >
                            {/* Hover Gradient Border Effect */}
                            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                            {/* Icon Box */}
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                <service.icon className="h-7 w-7" />
                            </div>

                            <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                                {service.title}
                            </h3>

                            <p className="text-muted-foreground/80 leading-relaxed font-medium">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

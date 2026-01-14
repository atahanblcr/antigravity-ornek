/**
 * WhatsApp URL'i oluşturmak için yardımcı fonksiyonlar
 * Reference.md Bölüm 6 gereksinimlerine uygun
 */

/**
 * Telefon numarasını WhatsApp formatına dönüştürür
 * +, 00, parantez ve tire karakterlerini temizler
 * @example formatWhatsAppNumber("+90 (555) 123-4567") => "905551234567"
 */
export const formatWhatsAppNumber = (input: string): string => {
    // Sadece rakamları tut
    return input.replace(/\D/g, '').replace(/^00/, '')
}

interface OrderItem {
    name: string
    quantity: number
    attributes?: Record<string, string>
    price?: number
}

interface WhatsAppOrderParams {
    storeName: string
    phoneNumber: string
    items: OrderItem[]
    totalAmount?: number
    orderReference?: string
}

/**
 * WhatsApp sipariş mesajı oluşturur
 * Reference.md Bölüm 6.1 şablonuna uygun
 */
export const createOrderMessage = ({
    storeName,
    items,
    totalAmount,
    orderReference,
}: Omit<WhatsAppOrderParams, 'phoneNumber'>): string => {
    const itemLines = items.map((item) => {
        const attributes = item.attributes
            ? ` (${Object.entries(item.attributes)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')})`
            : ''

        const quantity = item.quantity > 1 ? ` (x${item.quantity})` : ''
        const price = item.price ? ` - ${item.price.toLocaleString('tr-TR')} TL` : ''

        return `• ${item.name}${quantity}${attributes}${price}`
    })

    const lines = [
        `Merhaba ${storeName},`,
        '',
        'Aşağıdaki ürünleri sipariş etmek istiyorum:',
        '',
        ...itemLines,
    ]

    if (totalAmount) {
        lines.push('', `Toplam Tutar: ${totalAmount.toLocaleString('tr-TR')} TL`)
    }

    if (orderReference) {
        lines.push(`Sipariş Referansı: ${orderReference}`)
    }

    return lines.join('\n')
}

/**
 * WhatsApp Click-to-Chat URL'i oluşturur
 * Boşluk: %20, Satır sonu: %0A olarak kodlanır
 */
export const createWhatsAppUrl = (params: WhatsAppOrderParams): string => {
    const formattedNumber = formatWhatsAppNumber(params.phoneNumber)
    const message = createOrderMessage(params)
    const encodedMessage = encodeURIComponent(message)
        .replace(/%20/g, '%20')
        .replace(/%0A/g, '%0A')

    return `https://wa.me/${formattedNumber}?text=${encodedMessage}`
}

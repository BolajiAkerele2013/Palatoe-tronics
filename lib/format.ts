export const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "NGN"
    }).format(price)
}
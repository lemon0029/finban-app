import ProductList from "@/app/products/product-list";
import {RedirectToSignIn, SignedIn} from "@daveyplate/better-auth-ui";

export default function ProductsPage() {

    return (
        <>
            <RedirectToSignIn/>
            <SignedIn>
                <main className="container self-center p-4 md:p-6">
                    <ProductList/>
                </main>
            </SignedIn>
        </>
    )
}

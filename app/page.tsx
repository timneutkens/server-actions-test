import Link from "next/link";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAll, get, set } from "./next-session";

async function getCart() {
  const cart = await getAll("cart");
  if (!cart) {
    return [];
  }
  return cart;
}

function getProductInCart(productId: string) {
  return get(productId, "cart");
}

async function addProduct(productId: string) {
  const productAmountInCart = await getProductInCart(productId);

  await set(
    productId,
    productAmountInCart ? (Number(productAmountInCart) + 1).toString() : "1",
    "cart"
  );
}

async function productForm(formData: FormData) {
  "use server";
  const productId = formData.get("productId");
  if (!productId) {
    return;
  }

  await addProduct(productId.toString());
  // revalidateTag("cart");
  revalidatePath("/");
}

export async function Cart() {
  const value: any = await getCart();

  const cartItems = Object.entries(value);
  cartItems.sort(([, amountA], [, amountB]) => {
    return Number(amountB) - Number(amountA);
  });

  return (
    <ul>
      {cartItems.map(([productId, amount]: any) => {
        return (
          <li key={productId}>
            {productId}: {amount}
          </li>
        );
      })}
    </ul>
  );
}

export default async function Home() {
  return (
    <div className="bg-white">
      <h1>Cart</h1>
      <Cart />

      <form action={productForm}>
        <input type="text" name="productId" />
        <button type="submit">Add to cart</button>
      </form>

      <Link href="/cart" prefetch={true}>
        Go to Dedicated Cart Page
      </Link>
    </div>
  );
}

import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(
    req: Request,
    { params}: {params: Promise<{ courseId: string}>}
) {
    try {
        const user = await currentUser();

        if (!user || !user.id || !user.emailAddresses?.[0]?. emailAddress) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const resolvedParams = await params; 
        const course = await db.course.findUnique({
            where: {
                id: resolvedParams.courseId,
                isPublished: true,
            }
        });

        const purchase = await db.purchase.findUnique ({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: resolvedParams.courseId
                }
            }
        });

        if (purchase) {
            return new NextResponse("Already purchase", { status: 400 });
        }

        if (!course) {
            return new NextResponse("Not found", { status: 404 });
        }

        const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                quantity: 1,
                price_data: {
                    currency: "USD",
                    product_data: {
                        name: course.title,
                        description: course.description!,
                    },
                    unit_amount: Math.round(course.price! * 100),
                }
            }
        ];

        let stripCustomer = await db.stripeCustomer.findUnique ({
            where: {
                userId: user.id,
            },
            select: {
                stripeCustomerId: true,
            }
        });

        if (!stripCustomer) {
            const customer = await stripe.customers.create({
                email: user.emailAddresses[0].emailAddress,
            });

            stripCustomer = await db.stripeCustomer.create({
                data: {
                    userId: user.id,
                    stripeCustomerId: customer.id,
                }
            });
        }

        const session = await stripe.checkout.sessions.create({
            customer: stripCustomer.stripeCustomerId,
            line_items,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?canceled=1`,
            metadata: {
                courseId: course.id,
                userId: user.id
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.log("[COURSE_ID_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}
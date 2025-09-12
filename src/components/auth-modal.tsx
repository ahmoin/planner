"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthModal({
	authFlow,
	setAuthFlow,
	showAuthModal,
	setShowAuthModal,
}: {
	authFlow: "signIn" | "signUp";
	setAuthFlow: (authFlow: "signIn" | "signUp") => void;
	showAuthModal: boolean;
	setShowAuthModal: (showAuthModal: boolean) => void;
}) {
	const { signIn } = useAuthActions();

	return (
		<Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{authFlow === "signIn" ? "Login" : "Sign up"} to draw
					</DialogTitle>
					<DialogDescription>
						Please {authFlow === "signIn" ? "login" : "sign up"} to start
						drawing and save your work. You can explore the canvas without{" "}
						{authFlow === "signIn" ? "logging in" : "signing up"}.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					<Button
						onClick={async () => {
							try {
								await signIn("google");
								setShowAuthModal(false);
							} catch (error) {
								console.error("Sign in failed:", error);
							}
						}}
						variant="outline"
						className="w-full"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							className="w-4 h-4 mr-2"
						>
							<title>Google</title>
							<path
								d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
								fill="currentColor"
							/>
						</svg>
						{authFlow === "signIn" ? "Login" : "Sign up"}. with Google
					</Button>
					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
						<span className="relative z-10 bg-background px-2 text-muted-foreground">
							Or continue with
						</span>
					</div>

					<form
						onSubmit={async (e) => {
							e.preventDefault();
							const formData = new FormData(e.target as HTMLFormElement);
							formData.set("flow", authFlow);

							try {
								await signIn("password", formData);
								toast.success("Signed in successfully!");
								setShowAuthModal(false);
							} catch (error) {
								console.warn(error);
								toast.error(
									authFlow === "signIn"
										? "Could not login, did you mean to sign up?"
										: "Could not sign up, try making a stronger password or signing if you already have an account.",
								);
							}
						}}
					>
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									name="email"
									placeholder="m@example.com"
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="password">Password</Label>
								<Input id="password" type="password" name="password" required />
							</div>
							<Button type="submit" className="w-full">
								{authFlow === "signIn" ? "Login" : "Sign Up"}
							</Button>
						</div>
					</form>

					<div className="text-center text-sm">
						{authFlow === "signIn"
							? "Don't have an account? "
							: "Already have an account? "}
						<button
							type="button"
							onClick={() =>
								setAuthFlow(authFlow === "signIn" ? "signUp" : "signIn")
							}
							className="underline underline-offset-4 hover:text-primary"
						>
							{authFlow === "signIn" ? "Sign up instead" : "Login instead"}
						</button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

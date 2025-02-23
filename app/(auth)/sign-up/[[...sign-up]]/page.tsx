import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <SignUp 
            appearance={{
                elements: {
                    formButtonPrimary: 
                        "bg-emerald-600 hover:bg-emerald-700 text-sm normal-case",
                    card: 
                        "bg-white/80 backdrop-blur-lg shadow-xl",
                    headerTitle: 
                        "text-emerald-800",
                    headerSubtitle: 
                        "text-emerald-600",
                    socialButtonsBlockButton: 
                        "border-emerald-100 hover:bg-emerald-50",
                    socialButtonsBlockButtonText: 
                        "text-emerald-700",
                    formFieldLabel: 
                        "text-emerald-700",
                    formFieldInput: 
                        "border-emerald-100 focus:border-emerald-500",
                    footerActionLink: 
                        "text-emerald-600 hover:text-emerald-800",
                    identityPreviewText: 
                        "text-emerald-700",
                }
            }}
            forceRedirectUrl='/'
        />
    )
}
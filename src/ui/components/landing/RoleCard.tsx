import { LucideIcon, Lock } from 'lucide-react';
import { Button } from '@/ui/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/ui/components/ui/card';

interface RoleCardProps {
	icon: LucideIcon;
	iconColor: string;
	title: string;
	description: string;
	buttonText: string;
	buttonColor: string;
	onClick: () => void;
	requiresLock?: boolean;
	animationDelay?: string;
}

export function RoleCard({
	icon: Icon,
	iconColor,
	title,
	description,
	buttonText,
	buttonColor,
	onClick,
	requiresLock = false,
	animationDelay,
}: RoleCardProps) {
	return (
		<Card
			className="group w-full sm:w-80 lg:w-96 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-0 shadow-lg cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl bg-white/80 backdrop-blur-sm opacity-0 animate-[slide-up_0.6s_ease-out_forwards]"
			style={animationDelay ? { animationDelay } : undefined}
			onClick={onClick}
		>
			<CardHeader className="items-center pb-2">
				<div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gray-50 mb-4 sm:mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${iconColor.replace('text-', 'bg-').replace('600', '100')}`}>
					<Icon className={`h-12 w-12 sm:h-16 sm:w-16 ${iconColor}`} />
				</div>
				<CardTitle className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3 tracking-tight text-center">
					{title}
				</CardTitle>
				<CardDescription className="text-gray-500 text-center text-base sm:text-lg leading-relaxed max-w-[280px] px-2">
					{description}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-4 sm:pt-6">
				<Button
					className={`w-full py-5 sm:py-7 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 ${buttonColor} hover:brightness-110 hover:shadow-lg active:scale-95`}
				>
					{requiresLock && <Lock className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 opacity-80" />}
					{buttonText}
				</Button>
			</CardContent>
		</Card>
	);
}



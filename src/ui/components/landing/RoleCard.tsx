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
	className?: string;
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
	className,
}: RoleCardProps) {
	return (
		<Card
			className={`group w-full p-[2vh] sm:p-[2.5vh] md:p-[3vh] rounded-2xl sm:rounded-2xl md:rounded-3xl border-0 shadow-lg cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl bg-white/80 backdrop-blur-sm opacity-0 animate-[slide-up_0.6s_ease-out_forwards] ${className || ''}`}
			style={animationDelay ? { animationDelay } : undefined}
			onClick={onClick}
		>
			<CardHeader className="items-center pb-[1vh]">
				<div className={`p-[1.5vh] sm:p-[2vh] rounded-xl sm:rounded-2xl bg-gray-50 mb-[1.5vh] sm:mb-[2vh] transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${iconColor.replace('text-', 'bg-').replace('600', '100')}`}>
					<Icon className={`h-[4vh] w-[4vh] sm:h-[5vh] sm:w-[5vh] max-h-20 max-w-20 ${iconColor}`} />
				</div>
				<CardTitle className="text-[2.2vh] sm:text-[2.5vh] md:text-[2.8vh] lg:text-[3.2vh] font-extrabold text-gray-900 mb-[1vh] tracking-tight text-center">
					{title}
				</CardTitle>
				<CardDescription className="text-[1.4vh] sm:text-[1.6vh] md:text-[1.8vh] text-gray-500 text-center leading-relaxed w-full px-2">
					{description}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-[1.5vh]">
				<Button
					className={`w-full py-[2vh] sm:py-[2.5vh] text-[1.6vh] sm:text-[1.8vh] md:text-[2vh] font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 ${buttonColor} hover:brightness-110 hover:shadow-lg active:scale-95`}
				>
					{requiresLock && <Lock className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5 mr-2 sm:mr-2 md:mr-3 opacity-80" />}
					{buttonText}
				</Button>
			</CardContent>
		</Card>
	);
}



import { doctors } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import placeholderImages from "@/lib/placeholder-images.json";

export default function DoctorsPage() {
    const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');
    
    return (
        <div className="grid gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Our Doctors</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {doctors.map(doctor => (
                    <Card key={doctor.id}>
                        <CardHeader className="flex-row gap-4 items-center">
                             <Avatar className="h-16 w-16 border">
                                {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint} />}
                                <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{doctor.name}</CardTitle>
                                <CardDescription>{doctor.specialty}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                           <p className="text-sm text-muted-foreground">{doctor.bio}</p>
                           <Button asChild variant="outline" className="mt-2">
                               <Link href="#">View Profile</Link>
                           </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

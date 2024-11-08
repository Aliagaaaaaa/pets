import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from './pagination';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Animal {
  id: number;
  nombre: string;
  tipo: string;
  edad: string;
  estado: string;
  genero: string;
  desc_fisica: string;
  desc_personalidad: string;
  desc_adicional: string;
  esterilizado: number;
  vacunas: number;
  imagen: string;
  equipo: string;
  region: string;
  comuna: string;
  url: string;
}

interface ApiResponse {
  data: Animal[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export default function AnimalList() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimals(currentPage);
  }, [currentPage]);

  const fetchAnimals = async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://huachitos.cl/api/animales?page=${page}`);
      if (!response.ok) {
        throw new Error('Failed to fetch animals');
      }
      const data: ApiResponse = await response.json();
      setAnimals(data.data);
      setTotalPages(data.meta.last_page);
    } catch (err) {
      setError('Error fetching animals. Please try again later.');
      console.error('Error fetching animals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Animales en Adopción</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {animals.map((animal) => (
          <Card key={animal.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{animal.nombre}</CardTitle>
              <CardDescription>{animal.tipo} - {animal.edad}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <Avatar className="w-full h-48 rounded-lg mb-4">
                <AvatarImage src={animal.imagen} alt={animal.nombre} className="object-cover" />
                <AvatarFallback>{animal.nombre[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Badge variant={animal.estado === 'adopcion' ? 'default' : 'secondary'}>
                  {animal.estado}
                </Badge>
                <Badge variant="outline">{animal.genero}</Badge>
                <div dangerouslySetInnerHTML={{ __html: animal.desc_fisica }} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.open(animal.url, '_blank')}>
                Más información
              </Button>
              <div className="text-sm text-muted-foreground">
                {animal.region}, {animal.comuna}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button 
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <Button 
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Página siguiente</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
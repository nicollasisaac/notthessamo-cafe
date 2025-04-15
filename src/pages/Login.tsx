
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'pi3thacker') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/');
    } else {
      toast({
        variant: "destructive",
        title: "Senha incorreta",
        description: "Por favor, tente novamente."
      });
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `url('https://s3.amazonaws.com/sweettooth-api-uploads/presigned_uploads/361840/1424ae59a4a6079acd2a/Frame%205.png?color=fffffff')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Notthesamo Cafe</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;

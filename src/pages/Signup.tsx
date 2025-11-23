import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useNavigate, Link } from "react-router-dom";

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      return; // toast handled via Auth (we keep simple)
    }
    setLoading(true);
    const ok = await signup(email.trim(), password);
    setLoading(false);
    if (ok) navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-6">
        <h2 className="text-2xl font-semibold mb-4">Create account</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full" disabled={loading || password !== confirm}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground mt-4">
          Already have an account? <Link to="/login" className="text-primary underline">Log in</Link>
        </p>
      </Card>
    </div>
  );
};

export default Signup;

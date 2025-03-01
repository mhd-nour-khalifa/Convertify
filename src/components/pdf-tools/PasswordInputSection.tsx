
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordInputSectionProps {
  isProcessing: boolean;
  onProtect: (password: string) => void;
}

const PasswordInputSection = ({ isProcessing, onProtect }: PasswordInputSectionProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleSubmit = () => {
    if (password !== confirmPassword) {
      return false;
    }
    onProtect(password);
    return true;
  };

  return (
    <div className="bg-card rounded-xl p-8 shadow-subtle">
      <h3 className="text-xl font-medium mb-6">Set Password Protection</h3>
      
      <div className="space-y-6 max-w-md mx-auto">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <Input
            id="password"
            type="password"
            placeholder="Enter a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirm-password">Confirm Password</label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Process PDF
            </>
          )}
        </Button>
        
        <div className="text-sm text-amber-500 mt-4">
          <p>Note: True PDF password protection requires server-side processing. 
          This client-side implementation has limitations.</p>
        </div>
      </div>
    </div>
  );
};

export default PasswordInputSection;

import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditablePostitProps {
  id: string;
  defaultText: string;
  backgroundColor: string;
  textColor?: string;
  rotation?: string;
  position: 'left' | 'right';
}

/**
 * Componente de postit editable que permite a cualquier visitante modificar el texto
 * El contenido se guarda en localStorage para persistencia
 */
export const EditablePostit = ({
  id,
  defaultText,
  backgroundColor,
  textColor = 'text-gray-800',
  rotation = '-rotate-2',
  position,
}: EditablePostitProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(defaultText);
  const [tempText, setTempText] = useState(defaultText);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar texto guardado de localStorage al montar
  useEffect(() => {
    const savedText = localStorage.getItem(`postit-${id}`);
    if (savedText) {
      setText(savedText);
      setTempText(savedText);
    }
  }, [id]);

  // Auto-focus cuando entra en modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const finalText = tempText.trim() || defaultText;
    setText(finalText);
    localStorage.setItem(`postit-${id}`, finalText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempText(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const positionClasses = position === 'left' ? 'left-[10%]' : 'right-[8%]';

  return (
    <div
      className={`hidden md:block absolute bottom-0 ${positionClasses} shadow-xl rounded-sm transform ${rotation} z-10 group`}
      style={{
        backgroundColor,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div className="relative px-6 py-3">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
              className={`${textColor} font-semibold text-xl bg-transparent border-b-2 border-current outline-none min-w-[150px] max-w-[250px]`}
              placeholder="Escribe algo..."
            />
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-white/20"
                onClick={handleSave}
                title="Guardar"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-white/20"
                onClick={handleCancel}
                title="Cancelar"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className={`text-xl ${textColor} font-semibold`}>{text}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              onClick={() => setIsEditing(true)}
              title="Editar"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Indicador visual de que es editable (solo visible al hacer hover) */}
      {!isEditing && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BrazilCityAutocomplete({ value, onChange, placeholder = "Digite o nome da cidade..." }) {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCities = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome`
      );
      const cities = await response.json();
      
      const filtered = cities
        .filter(city => 
          city.nome.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map(city => ({
          name: city.nome,
          state: city.microrregiao.mesorregiao.UF.sigla,
          fullName: `${city.nome}, ${city.microrregiao.mesorregiao.UF.sigla}`
        }));
      
      setSuggestions(filtered);
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    searchCities(newValue);
  };

  const handleSelectCity = (city) => {
    setInputValue(city.fullName);
    onChange(city.fullName);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          className="pl-10 bg-slate-800 border-purple-900/30 text-white"
        />
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2"
          >
            <Card className="bg-slate-900 border-purple-500/30 max-h-60 overflow-y-auto">
              {suggestions.map((city, index) => (
                <button
                  key={`${city.name}-${city.state}-${index}`}
                  onClick={() => handleSelectCity(city)}
                  className="w-full px-4 py-3 text-left hover:bg-purple-900/30 transition flex items-center gap-2 border-b border-slate-700 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">{city.name}</p>
                    <p className="text-gray-400 text-xs">{city.state}</p>
                  </div>
                </button>
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <p className="text-xs text-gray-400 mt-1">Buscando cidades...</p>
      )}
    </div>
  );
}
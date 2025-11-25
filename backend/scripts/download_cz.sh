#!/bin/bash
# Wrapper skript pro snadné stahování DMR 5G dat

cd "$(dirname "$0")/.."
source venv/bin/activate

echo "🏛️  CYBER ARCHEOLOGY - DMR 5G Downloader"
echo "=========================================="
echo ""

# Detekuj režim z argumentu
case "$1" in
  test)
    echo "🧪 TEST - Stáhne 10 listů pro ověření"
    python scripts/download_czech_republic.py --mode test
    ;;
  
  cities|mesta)
    echo "🏙️  MĚSTA - Praha, Brno, Ostrava, ... (top 20 měst)"
    python scripts/download_czech_republic.py --mode cities
    ;;
  
  full|cela-cr)
    echo "🌍 CELÁ ČR - 16,301 listů (~40-50 GB, 3-4 dny)"
    echo "⚠️  VAROVÁNÍ: Toto stáhne VŠECHNA data!"
    echo ""
    read -p "Opravdu pokračovat? (ano/ne): " confirm
    if [ "$confirm" = "ano" ]; then
      python scripts/download_czech_republic.py --mode full --rate 2.0
    else
      echo "❌ Zrušeno"
    fi
    ;;
  
  region|kraj)
    if [ -z "$2" ]; then
      echo "❌ Zadejte název kraje!"
      echo ""
      echo "Dostupné kraje:"
      echo "  praha, stredocesky, jihocesky, plzensky,"
      echo "  karlovarsky, ustecky, liberecky, kralovehradecky,"
      echo "  pardubicky, vysocina, jihomoravsky, olomoucky,"
      echo "  moravskoslezsky, zlinsky"
      echo ""
      echo "Příklad: ./download_cz.sh kraj praha"
      exit 1
    fi
    
    echo "🗺️  KRAJ: $2"
    python scripts/download_czech_republic.py --mode regions --region "$2"
    ;;
  
  custom)
    if [ -z "$2" ]; then
      echo "❌ Zadejte bbox!"
      echo "Formát: min_lat,min_lon,max_lat,max_lon"
      echo "Příklad: ./download_cz.sh custom 49.95,14.25,50.20,14.70"
      exit 1
    fi
    
    echo "📍 CUSTOM BBOX: $2"
    python scripts/download_czech_republic.py --mode custom --bbox "$2"
    ;;
  
  status|cache)
    echo "📊 CACHE STATUS"
    echo "─────────────────"
    
    # Path from scripts/ directory
    GEOTIFF_DIR="/home/gandalf/Projekty/cyber-archeology/backend/data_cache/dmr5g/geotiff"
    
    if [ -d "$GEOTIFF_DIR" ]; then
      COUNT=$(find "$GEOTIFF_DIR" -name "*.tif" 2>/dev/null | wc -l)
      
      if [ "$COUNT" -gt 0 ]; then
        SIZE=$(du -sh "$GEOTIFF_DIR" 2>/dev/null | cut -f1)
        echo "✅ Staženo: $COUNT mapových listů"
        echo "💾 Velikost: $SIZE"
        echo "📁 Cesta: $GEOTIFF_DIR"
        echo ""
        echo "Poslední 5 stažených:"
        find "$GEOTIFF_DIR" -name "*.tif" -printf "%T+ %p %s\n" 2>/dev/null | \
          sort -r | head -5 | awk '{printf "  %s (%.1f KB)\n", $2, $3/1024}'
      else
        echo "❌ Žádná data v cache"
      fi
    else
      echo "❌ Cache adresář neexistuje: $GEOTIFF_DIR"
    fi
    ;;
  
  help|--help|-h|"")
    echo "Použití: ./download_cz.sh [REŽIM] [PARAMETRY]"
    echo ""
    echo "REŽIMY:"
    echo "  test           🧪 Test (10 listů, ~30 MB)"
    echo "  mesta          🏙️  Top 20 měst (~2-3 GB, ~4 hodiny)"
    echo "  cela-cr        🌍 Celá ČR (~40-50 GB, 3-4 dny)"
    echo "  kraj [NÁZEV]   🗺️  Konkrétní kraj"
    echo "  custom [BBOX]  📍 Vlastní bbox"
    echo "  status         📊 Zobrazit cache status"
    echo ""
    echo "PŘÍKLADY:"
    echo "  ./download_cz.sh test                    # Test"
    echo "  ./download_cz.sh mesta                   # Města"
    echo "  ./download_cz.sh kraj praha              # Praha kraj"
    echo "  ./download_cz.sh custom 50,14,50.2,14.5  # Praha bbox"
    echo "  ./download_cz.sh status                  # Stav cache"
    echo ""
    echo "KRAJE:"
    echo "  praha, stredocesky, jihocesky, plzensky, karlovarsky,"
    echo "  ustecky, liberecky, kralovehradecky, pardubicky,"
    echo "  vysocina, jihomoravsky, olomoucky, moravskoslezsky, zlinsky"
    echo ""
    echo "⏱️  ODHADY ČASU:"
    echo "  Test:     ~2 minuty"
    echo "  Města:    ~4-6 hodin"
    echo "  Kraj:     ~6-12 hodin"
    echo "  Celá ČR:  ~3-4 dny"
    echo ""
    echo "💡 TIP: Spusťte nejdřív 'test' pro ověření, pak 'mesta'"
    ;;
  
  *)
    echo "❌ Neznámý režim: $1"
    echo "Použijte: ./download_cz.sh help"
    exit 1
    ;;
esac


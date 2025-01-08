import LoadingButton from '@mui/lab/LoadingButton';
import axios from 'axios';
import { useCallback, useState } from 'react';
import useAuth from '../../lib/hooks/useAuth';

interface Props {
  calculationId?: string;
  hierarchyCode: string;
  setNorms: (norms: SearchResult[]) => void;
}

export interface SearchResult {
  id: string;
  description: string;
  metadata: {
    source: string;
    row: number;
    idPost: string;
  };
  score: number;
  isSelected: boolean;
  norm: {
    idnr: string;
    idpost: string;
    idparent: null | string;
    idksr: string;
    idlev: string;
    idmiddel: string;
    aantinzet: string;
    norm: string;
    hv: string;
    ideh: string;
    ehprijs_x: string;
    idvaluta: string;
    idbtw: null | string;
    productie: string;
    netto: string;
    nodevolgnr: string;
    bruto: string;
    vlaggen: string;
    factorehp: string;
    opaantinzet: string;
    opnorm: string;
    ophv: string;
    opideh_x: null | string;
    opehprijs_x: string;
    opfactorehp: string;
    opnetto: string;
    opbruto: string;
    opproductie: null | string;
    pro2modified: string;
    idcal_x: string;
    middel_idlev: string;
    code_x: string;
    omschrijving: string;
    middel_ideh: string;
    ehprijs_y: string;
    middel_idvaluta: string;
    korting: string;
    opkorting: string;
    opehprijs_y: string;
    opideh_y: null | string;
    middel_pro2modified: string;
    code_y: string;
    lev_omschrijving: string;
    idcal_y: string;
    lev_pro2modified: string;
    code: string;
    eh_omschrijving: string;
    idcal: string;
    eh_pro2modified: string;
    valuta_code: string;
    valuta_omschrijving: string;
    koers: string;
    standaard: string;
    valuta_idcal: string;
    teken: string;
    valuta_pro2modified: string;
  };
}

export default function GetSearchResults({
  calculationId,
  hierarchyCode,
  setNorms: setSearchResults,
}: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hanldeGetSearchResults = useCallback(async () => {
    try {
      setLoading(true);
      if (!calculationId) {
        throw new Error('Calculation ID is required');
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/calculations/${calculationId}/post/${hierarchyCode}/search-results`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response && response.data) {
        setSearchResults(response.data);
        setLoading(false);
      } else {
        throw new Error('Error fetching norms data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setLoading(false);
      console.error(err);
    }
  }, []);

  return (
    <LoadingButton loading={loading} variant="contained" onClick={hanldeGetSearchResults}>
      Search
    </LoadingButton>
  );
}

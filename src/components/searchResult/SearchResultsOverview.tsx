import { useState, useEffect } from 'react';
import { Avatar, Badge, Button, Chip, Typography } from '@mui/material';
import { SearchResult } from './GetSearchResults';
import useAuth from '../../lib/hooks/useAuth';
import axios from 'axios';

interface Props {
  searchResults: SearchResult[];
}

export default function SearchResultsOverview({ searchResults }: Props) {
  const { token } = useAuth();
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    // Initialize state with the prop value
    setResults(searchResults);
  }, [searchResults]);

  async function setSearchResultAsSelected(id: string): Promise<void> {
    // Optimistically update the UI
    const updatedSearchResults = results.map((searchResult) => {
      if (searchResult.id === id) {
        return { ...searchResult, isSelected: true };
      } else {
        return { ...searchResult, isSelected: false };
      }
    });

    setResults(updatedSearchResults);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/posts?postSearchResultId=${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // Optionally, handle if the response indicates failure (unlikely in a successful post request)
      if (response.status !== 200) {
        // Handle the situation where the API call fails after optimistic UI update
        console.error('Failed to set search result as selected on the server.');
        // Optionally, revert the state change or show an error message
      }
    } catch (error) {
      console.error('Error calling API:', error);
      // Optionally, revert the state change or show an error message
    }
  }

  return (
    <>
      {results?.length > 0 && (
        <div className="w-1/3 pl-3 max-h-[calc(100svh-344px)] overflow-y-auto">
          <Typography>{results?.length} results</Typography>
          <ul className="w-full">
            {results?.map((searchResult) => (
              <li
                key={searchResult.id}
                className="flex items-center p-2 gap-2 my-2 mx-1 rounded-lg bg-white">
                <Avatar sx={{ backgroundColor: '#1876D1', width: 56, height: 56 }}>
                  <div className="text-sm">{searchResult.score.toFixed(1)}</div>
                </Avatar>
                <div className="flex gap-3 items-center">
                  <div>
                    <div>
                      {searchResult.isSelected ? (
                        <Chip label="Selected" color="success"></Chip>
                      ) : (
                        <Chip
                          label="Set as Selected"
                          color="primary"
                          onClick={() => setSearchResultAsSelected(searchResult.id)}></Chip>
                      )}
                    </div>
                    <div>{searchResult.description}</div>
                    <div>row: {searchResult.metadata.row}</div>
                    <div>source: {searchResult.metadata.source}</div>
                    <div>description: {searchResult.norm?.omschrijving}</div>
                    <div>
                      {searchResult.norm && (
                        <div>
                          <strong>
                            {searchResult.norm.hv} {searchResult.norm.eh_omschrijving} *{' '}
                            {searchResult.norm.ehprijs_x} {searchResult.norm.teken} ={' '}
                            {searchResult.norm.netto} {searchResult.norm.teken}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

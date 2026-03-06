
import { useState } from 'react';
import { DataGrid, GridToolbar } from '../../../lib';
import type { GridColDef, GridAggregationModel } from '../../../lib';
import './AggregationFooter.css';

interface Movie {
    id: number;
    title: string;
    gross: number;
    budget: number;
    profit: number;
    year: number;
    runtime: number;
    rating: number;
    votes: number;
    genre: string;
    studio: string;
}

const ROWS: Movie[] = [
    { id: 1, title: 'Titanic', gross: 2_187_425_379, budget: 200_000_000, profit: 1_987_425_379, year: 1997, runtime: 194, rating: 7.9, votes: 1_180_000, genre: 'Drama', studio: 'Paramount' },
    { id: 2, title: 'Star Wars: The Force Awakens', gross: 2_068_223_624, budget: 245_000_000, profit: 1_823_223_624, year: 2015, runtime: 138, rating: 7.8, votes: 950_000, genre: 'Sci-Fi', studio: 'Disney' },
    { id: 3, title: 'Avengers: Infinity War', gross: 2_048_359_754, budget: 316_000_000, profit: 1_732_359_754, year: 2018, runtime: 149, rating: 8.4, votes: 1_000_000, genre: 'Action', studio: 'Disney' },
    { id: 4, title: 'Spider-Man: No Way Home', gross: 1_892_768_346, budget: 200_000_000, profit: 1_692_768_346, year: 2021, runtime: 148, rating: 8.3, votes: 870_000, genre: 'Action', studio: 'Sony' },
    { id: 5, title: 'Jurassic World', gross: 1_671_713_208, budget: 150_000_000, profit: 1_521_713_208, year: 2015, runtime: 124, rating: 7.0, votes: 630_000, genre: 'Adventure', studio: 'Universal' },
    { id: 6, title: 'The Lion King', gross: 1_656_943_394, budget: 260_000_000, profit: 1_396_943_394, year: 2019, runtime: 118, rating: 6.9, votes: 330_000, genre: 'Animation', studio: 'Disney' },
    { id: 7, title: 'The Avengers', gross: 1_518_812_988, budget: 220_000_000, profit: 1_298_812_988, year: 2012, runtime: 143, rating: 8.0, votes: 1_350_000, genre: 'Action', studio: 'Disney' },
    { id: 8, title: 'Furious 7', gross: 1_516_045_911, budget: 190_000_000, profit: 1_326_045_911, year: 2015, runtime: 137, rating: 7.1, votes: 500_000, genre: 'Action', studio: 'Universal' },
    { id: 9, title: 'Frozen II', gross: 1_450_026_933, budget: 150_000_000, profit: 1_300_026_933, year: 2019, runtime: 103, rating: 6.8, votes: 310_000, genre: 'Animation', studio: 'Disney' },
    { id: 10, title: 'Avengers: Age of Ultron', gross: 1_402_805_868, budget: 279_900_000, profit: 1_122_905_868, year: 2015, runtime: 141, rating: 7.3, votes: 920_000, genre: 'Action', studio: 'Disney' },
    { id: 11, title: 'Black Panther', gross: 1_347_280_838, budget: 200_000_000, profit: 1_147_280_838, year: 2018, runtime: 134, rating: 7.3, votes: 830_000, genre: 'Action', studio: 'Disney' },
    { id: 12, title: 'Harry Potter and the Deathly Hallows Pt 2', gross: 1_342_025_430, budget: 125_000_000, profit: 1_217_025_430, year: 2011, runtime: 130, rating: 8.1, votes: 920_000, genre: 'Fantasy', studio: 'WB' },
    { id: 13, title: 'Star Wars: The Last Jedi', gross: 1_332_539_889, budget: 317_000_000, profit: 1_015_539_889, year: 2017, runtime: 152, rating: 7.0, votes: 600_000, genre: 'Sci-Fi', studio: 'Disney' },
    { id: 14, title: 'Jurassic World: Fallen Kingdom', gross: 1_309_484_461, budget: 170_000_000, profit: 1_139_484_461, year: 2018, runtime: 128, rating: 6.2, votes: 410_000, genre: 'Adventure', studio: 'Universal' },
    { id: 15, title: 'Frozen', gross: 1_290_000_000, budget: 150_000_000, profit: 1_140_000_000, year: 2013, runtime: 102, rating: 7.5, votes: 700_000, genre: 'Animation', studio: 'Disney' },
    { id: 16, title: 'Beauty and the Beast', gross: 1_263_521_126, budget: 160_000_000, profit: 1_103_521_126, year: 2017, runtime: 129, rating: 7.1, votes: 350_000, genre: 'Fantasy', studio: 'Disney' },
    { id: 17, title: 'Incredibles 2', gross: 1_242_805_359, budget: 200_000_000, profit: 1_042_805_359, year: 2018, runtime: 118, rating: 7.7, votes: 460_000, genre: 'Animation', studio: 'Disney' },
    { id: 18, title: 'The Fate of the Furious', gross: 1_236_005_118, budget: 250_000_000, profit: 986_005_118, year: 2017, runtime: 136, rating: 6.6, votes: 390_000, genre: 'Action', studio: 'Universal' },
    { id: 19, title: 'Iron Man 3', gross: 1_214_811_252, budget: 200_000_000, profit: 1_014_811_252, year: 2013, runtime: 130, rating: 7.2, votes: 810_000, genre: 'Action', studio: 'Disney' },
    { id: 20, title: 'Minions', gross: 1_159_398_397, budget: 74_000_000, profit: 1_085_398_397, year: 2015, runtime: 91, rating: 6.4, votes: 360_000, genre: 'Animation', studio: 'Universal' },
    { id: 21, title: 'Captain America: Civil War', gross: 1_153_304_495, budget: 250_000_000, profit: 903_304_495, year: 2016, runtime: 147, rating: 7.8, votes: 830_000, genre: 'Action', studio: 'Disney' },
    { id: 22, title: 'Aquaman', gross: 1_148_161_807, budget: 160_000_000, profit: 988_161_807, year: 2018, runtime: 143, rating: 6.9, votes: 480_000, genre: 'Action', studio: 'WB' },
    { id: 23, title: 'The Dark Knight Rises', gross: 1_084_939_099, budget: 250_000_000, profit: 834_939_099, year: 2012, runtime: 164, rating: 8.4, votes: 1_500_000, genre: 'Action', studio: 'WB' },
    { id: 24, title: 'Toy Story 4', gross: 1_073_394_593, budget: 200_000_000, profit: 873_394_593, year: 2019, runtime: 100, rating: 7.7, votes: 310_000, genre: 'Animation', studio: 'Disney' },
    { id: 25, title: 'Top Gun: Maverick', gross: 1_491_000_000, budget: 170_000_000, profit: 1_321_000_000, year: 2022, runtime: 130, rating: 8.3, votes: 560_000, genre: 'Action', studio: 'Paramount' },
];

const fmt$ = ({ value }: { value: any }) =>
    typeof value === 'number' ? `$${value.toLocaleString('en-US')}` : String(value ?? '');

const columns: GridColDef<Movie>[] = [
    { field: 'title', headerName: 'Title', width: 310, sortable: true },
    { field: 'studio', headerName: 'Studio', width: 110, sortable: true },
    { field: 'genre', headerName: 'Genre', width: 110, sortable: true },
    { field: 'year', headerName: 'Year', width: 80, sortable: true, type: 'number', align: 'right', headerAlign: 'right', aggregable: true },
    { field: 'runtime', headerName: 'Runtime (min)', width: 130, sortable: true, type: 'number', align: 'right', headerAlign: 'right', aggregable: true },
    {
        field: 'gross',
        headerName: 'Box Office',
        width: 160,
        sortable: true,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: fmt$,
    },
    {
        field: 'budget',
        headerName: 'Budget',
        width: 140,
        sortable: true,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: fmt$,
    },
    {
        field: 'profit',
        headerName: 'Profit',
        width: 155,
        sortable: true,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: fmt$,
    },
    {
        field: 'rating',
        headerName: 'IMDb Rating',
        width: 120,
        sortable: true,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: ({ value }) => typeof value === 'number' ? value.toFixed(1) : String(value ?? ''),
    },
    {
        field: 'votes',
        headerName: 'IMDb Votes',
        width: 130,
        sortable: true,
        type: 'number',
        align: 'right',
        headerAlign: 'right',
        aggregable: true,
        valueFormatter: ({ value }) => typeof value === 'number' ? value.toLocaleString('en-US') : String(value ?? ''),
    },
];

export default function AggregationFooterExample() {
    const [aggregationModel, setAggregationModel] = useState<GridAggregationModel>({
        gross: 'sum',
        budget: 'sum',
        profit: 'sum',
        rating: 'avg',
        runtime: 'avg',
    });

    return (
        <div className="aggregation-demo-container">
            <h2>Aggregation — Toolbar Configuration</h2>
            <p className="aggregation-demo-description">
                Click the <strong>Σ (sigma) icon</strong> in the toolbar to open the aggregation panel.
                Choose a function (sum, avg, count, min, max) for any numeric column — the result
                appears as a sticky footer row below the data.
            </p>

            <DataGrid<Movie>
                rows={ROWS}
                columns={columns}
                autoHeight
                height={540}
                rowHeight={48}
                headerHeight={52}
                slots={{ toolbar: GridToolbar }}
                aggregationModel={aggregationModel}
                onAggregationModelChange={setAggregationModel}
                getAggregationPosition={() => 'footer'}
            />

            <div className="aggregation-model-preview">
                <strong>Current aggregation model:</strong>{' '}
                {JSON.stringify(aggregationModel)}
            </div>
        </div>
    );
}

// src/components/PlayersTable.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PlayersTable = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState({ name: '' });
    const [isEditing, setIsEditing] = useState(false);
    // gets ID for player from the backend
    //this is used for the create update and delete.
    const extractIdFromLink = (players) => {
        const selfLink = players._links?.self?.href;
        if (selfLink) {
            const parts = selfLink.split('/');
            return parts[parts.length - 1]; //extracts last part of the url
        }
        return null;
    };
    const fetchPlayers = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/players');
            console.log("response.data._embedded.players: ", response.data._embedded.players);
            setPlayers(response.data._embedded?.players || []); //either populkate the array or if data is missing set an empty array
            setLoading(false);
        } catch (err) {
            setError('Error fetching players');
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPlayers();
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing) {
                const playersId = extractIdFromLink(currentPlayer);
                const response = await axios.put(
                    `http://localhost:8080/api/players/${playersId}`,
                    currentPlayer,

                );
                if (response.status === 200 || response.status === 204) {
                    await fetchPlayers();
                    setIsDialogOpen(false);
                    setCurrentPlayer({ name: '' });
                    setIsEditing(false);
                }
            } else {
                const response = await axios.post(
                    'http://localhost:8080/api/players',
                    currentPlayer,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    }
                );
                if (response.status === 201 || response.status === 200) {
                    await fetchPlayers();
                    setIsDialogOpen(false);
                    setCurrentPlayer({ name: '' });
                }
            }
            setError(null);
        } catch (err) {
            setError(isEditing ? 'Error updating player' : 'Error creating player');
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (player) => {
        if (window.confirm('Are you sure you want to delete this player?')) {
            setLoading(true);
            try {
                const playersId = extractIdFromLink(player); // need id to delete the player
                if (!playersId) {
                    throw new Error('Could not find player ID');
                }
                const response = await axios.delete(
                    `http://localhost:8080/api/players/${playersId}`,
                );
                if (response.status === 200 || response.status === 204) {
                    await fetchPlayers();
                    setError(null);
                }

            } catch (err) {
                setError('Error deleting player');
            } finally {
                setLoading(false);
            }
        }
    };
    const openEditDialog = (player) => {
        setCurrentPlayer({
            ...player,
            id: extractIdFromLink(player)  // ' undefined ID' error editing without this
        });
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setCurrentPlayer({ name: '' });
        setIsEditing(false);
        setIsDialogOpen(true);
    };
    if (loading) return <p>Loading players...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="soccerTables">
            <h1>Players</h1>
            <button className="action-button" onClick={openCreateDialog}>Add Player</button>
            <table>
                <thead>
                <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Position</th>
                    <th>Age</th>
                    <th>Player Rating</th>
                </tr>
                </thead>
                <tbody>
                {players.map((player, index) => (
                    <React.Fragment key={index}>
                        <tr>
                            <td>{player.firstName}</td>
                            <td>{player.lastName}</td>
                            <td>{player.position}</td>
                            <td>{player.age}</td>
                            <td>{player.playerRating}</td>
                            <td>
                                <button className="action-button" onClick={() => openEditDialog(player)}>Edit</button>
                                <button className="action-button" onClick={() => handleDelete(player)}>Delete</button>
                            </td>
                        </tr>
                    </React.Fragment>
                ))}
                </tbody>
            </table>
            {isDialogOpen && (
                <div>
                    <h2>{isEditing ? 'Edit Player' : 'Create New Player'}</h2>
                    <form onSubmit={handleSubmit}>
                        <label>
                            new Player first name:&nbsp;
                            <input
                                value={currentPlayer.firstName}
                                onChange={(e) => setCurrentPlayer({...currentPlayer, firstName: e.target.value})}
                            />
                        </label>
                        <label>
                            new Player last name:&nbsp;
                            <input
                                value={currentPlayer.lastName}
                                onChange={(e) => setCurrentPlayer({...currentPlayer, lastName: e.target.value})}
                            />
                        </label>
                        <label>
                            new Player position:&nbsp;
                            <input
                                value={currentPlayer.position}
                                onChange={(e) => setCurrentPlayer({...currentPlayer, position: e.target.value})}
                            />
                        </label>
                        <label>
                            new Player age:&nbsp;
                            <input
                                value={currentPlayer.age}
                                onChange={(e) => setCurrentPlayer({...currentPlayer, age: e.target.value})}
                            />
                        </label>
                        <label>
                            new Player rating:&nbsp;e
                            <input
                                value={currentPlayer.playerRating}
                                onChange={(e) => setCurrentPlayer({...currentPlayer, playerRating: e.target.value})}
                            />
                        </label>
                        <button className="action-button">{isEditing ? 'Update' : 'Create'}</button>
                        <button className="action-button" onClick={() => setIsDialogOpen(false)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PlayersTable;
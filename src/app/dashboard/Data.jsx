"use client"; // This is a client component 

import axios from "axios"
import React, { useState, useEffect } from "react"
import { Card } from 'antd';

export default function Data() {

  const [loaded, setLoaded] = useState(false);
  const [playerStats, setPlayerStats] = useState({});
  const fetchData = async () => {
    try {
      const response = await axios.get("https://lookup-service-prod.mlb.com/json/named.sport_career_hitting.bam?league_list_id=%27mlb%27&game_type=%27R%27&player_id=%27493316%27");
      setPlayerStats(response.data.sport_career_hitting.queryResults.row);
      setLoaded(true);
      console.log(response.data);
    
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    fetchData();
  }, []);

  return(
    <>
      {loaded ? 
        <Card title="Insert Player Name" style={{ width: 300 }}>
          {/* <p>Card content</p> */}
          {/* <p>Card content</p> */}
          {/* <p>Card content</p> */}
          {/* {JSON.stringify(playerStats.sport_career_hitting.queryResults.row)} */}
          {Object.keys(playerStats).map((stat, index) => {
            return <p key={index}>{stat}: {playerStats[stat]}</p>
          })}
        </Card>: 
        <h1>Loading...</h1>}
    </>
  )
}
   import React, { useEffect, useState } from 'react';
   import axios from 'axios';

   function App() {
       const [data, setData] = useState(null);

       useEffect(() => {
           axios.get('http://localhost:3000/api/endpoint')
               .then(response => {
                   setData(response.data);
               })
               .catch(error => {
                   console.error('Error fetching data:', error);
               });
       }, []);

       return (
           <div>
               <h1>Ventura Recreacion</h1>
               {data ? <p>{data.message}</p> : <p>Loading...</p>}
           </div>
       );
   }

   export default App;
   
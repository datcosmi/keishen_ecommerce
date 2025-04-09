// //implementacion para el funcionamiento de next-auth
// // para poder visualizar dentro del schema next-auth dentro de supabase y saber que usuarios estan dentro

// import React from "react";
// import { createClient } from "@supabase/supabase-js";

// const UsersPage = async () => {
    
//     const supabase = createClient(
//         process.env.NEXT_PUBLIC_SUPABASE_URL!,
//         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//         {
//             db:{
//                 schema: "next_auth"
//             }
//         }
//     )

//     const { data } = await supabase
//     .from("users")
//     .select("*")

//     return <div>{JSON.stringify(data)}</div>
// }

// export default UsersPage;
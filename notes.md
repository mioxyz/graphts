# Notes

## 1. Concerning `Vertex<T>::moveBefore`
Theoretically this is an "impure" way of depicting the sequence of vertices. Ideally we would also depict the order by edges, but then we loose our strict Tree structure... 
We'd have shit going sideways between nodes & create loops. Even worse, we wouldn't be able to distinguish between what is showning containerization and what is depicting order.
So maybe it isn't the worst thing to be doing.

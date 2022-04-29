import "./List.css";
import Item from "./Item";

const List = ({ listOfItems }: any) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>URL</th>
            <th>Author</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {listOfItems.map(({objectId,...rest}: any) => (
            <Item key={objectId} {...rest}/>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default List;
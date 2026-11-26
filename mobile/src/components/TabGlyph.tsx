import { View } from 'react-native';

const strokes: Record<string, number[][]> = {
  parking: [[5,2,5,20],[5,3,14,3],[14,3,18,6],[18,6,18,10],[18,10,14,13],[14,13,5,13]],
  garage: [[2,10,11,3],[11,3,20,10],[4,9,4,20],[18,9,18,20],[4,20,18,20],[7,13,15,13],[7,16,15,16]],
  schedule: [[3,5,19,5],[3,5,3,20],[19,5,19,20],[3,20,19,20],[3,10,19,10],[7,2,7,7],[15,2,15,7]],
  account: [[7,4,11,2],[11,2,15,4],[15,4,15,8],[15,8,11,11],[11,11,7,8],[7,8,7,4],[3,20,4,16],[4,16,8,14],[8,14,14,14],[14,14,18,16],[18,16,19,20]],
};
export function TabGlyph({ name, color }: {name:string;color:string}) {
  return <View accessible={false} style={{width:22,height:22}}>{(strokes[name] ?? []).map(([x,y,u,v],i)=>{
    const width=Math.hypot(u-x,v-y);
    return <View key={i} style={{position:'absolute',left:(x+u-width)/2,top:(y+v)/2-1,width,height:2,borderRadius:1,backgroundColor:color,transform:[{rotate:Math.atan2(v-y,u-x)+'rad'}]}}/>;
  })}</View>;
}

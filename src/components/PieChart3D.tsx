import { useWindowDimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";

import { spacing, useThemeColors } from "../theme";

type SliceData = {
  name: string;
  value: number;
  color: string;
} & Record<string, unknown>;

interface PieChart3DProps {
  data: SliceData[];
  size?: number;
  innerRadius?: number;
  depth?: number;
  startAngle?: number;
  endAngle?: number;
}

export const PieChart3D: React.FC<PieChart3DProps> = ({ data, size }) => {
  const { width } = useWindowDimensions();
  const colors = useThemeColors();
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  const availableWidth = width - spacing.screenPadding * 2;
  const chartSize = size
    ? Math.min(size, availableWidth)
    : Math.min(availableWidth, 350);

  const chartData = data.map((d) => {
    const pct = ((d.value / total) * 100).toFixed(1);
    return {
      name: `${d.name} · ${pct}%`,
      population: d.value,
      color: d.color,
      legendFontColor: colors.text.secondary,
      legendFontSize: 13,
    };
  });

  return (
    <PieChart
      data={chartData}
      width={chartSize}
      height={220}
      chartConfig={{
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      }}
      accessor="population"
      backgroundColor="transparent"
      paddingLeft="15"
      center={[10, 0]}
    />
  );
};

export default PieChart3D;

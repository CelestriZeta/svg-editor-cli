import type { CircleView } from './CircleView.js';
import type { EllipseView } from './EllipseView.js';
import type { GroupView } from './GroupView.js';
import type { LineView } from './LineView.js';
import type { RectView } from './RectView.js';
import type { TextView } from './TextView.js';

export abstract class ShapeViewVisitor<T> {
  public abstract visitCircle(view: CircleView): T;
  public abstract visitEllipse(view: EllipseView): T;
  public abstract visitGroup(view: GroupView): T;
  public abstract visitLine(view: LineView): T;
  public abstract visitRect(view: RectView): T;
  public abstract visitText(view: TextView): T;
}

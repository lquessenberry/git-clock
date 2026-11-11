# Premium planning clocks

Request. This is not built. The default `git-clock` report stays commit
hours and sessions. These commands are a separate set. They read a local
card file. They do not call a host, and they do not treat clock hours as
a billing rate or a timesheet.

Activity hours from the session timer stay beside the commit clock. They
enter these commands only when the file marks them as the hours to use.

## Card file

```json
{
  "rate": 100,
  "fee": null,
  "cards": [
    {
      "id": "142",
      "points": 5,
      "clockHours": 3.2,
      "billedHours": 4,
      "sprint": "Sprint 1",
      "done": true
    }
  ]
}
```

`rate` is money per billed hour. `fee` is a fixed amount for the whole
set. Leave either one out when you do not have it. `billedHours` is the
invoice hour count. It is not the git-clock hour count. `clockHours` may
be omitted on a done card when a later import fills it from commits that
close that id.

## Quantizer

For each done card with points and clock hours:

```
multiplier = clock hours / story points
```

The calibration ratio is the median of those multipliers. The band is the
interquartile range. The report also prints the minimum, the maximum, and
the set ratio `sum(clock hours) / sum(points)`. The median is the ratio
to keep. The set ratio is context.

Open cards stay out. A card whose points were assigned after the hours
were known describes that assignment. It does not change the planning
scale of cards that are still open.

Example shape:

| Card | Points | Clock hours | Multiplier |
|---|---:|---:|---:|
| 142 | 5 | 3.2 | 0.64 |
| 156 | 3 | 2.1 | 0.70 |
| 161 | 8 | 4.8 | 0.60 |
| 170 | 2 | 1.9 | 0.95 |

Median 0.67. That means one finished point in this sample corresponded
to 0.67 clock hours. It does not mean a future 5-point card is 3.35
billed hours.

```bash
git-clock quantize cards.json
```

## Murphy, Unknown, and MacGyver

Story points stand for optimistic hours, times the things that go wrong,
times the unknowns, times a small buffer that makes the work shippable:

```
SP = H × M² × U × G
```

| Factor | Name | Meaning |
|---|---|---|
| H | optimistic hours | The raw hours if the work goes well |
| M | Murphy | Things that go wrong. Squared, because trouble compounds |
| U | Unknown | What the estimate did not know it did not know |
| G | MacGyver | The buffer that makes the result shippable |

People estimate SP directly. The calculator does not invent the four
factors from a point total. It prints SP when H, M, U, and G are all
given. It prints the one missing factor when the other three and SP are
given. It always prints the planning product `M² × U × G`.

```bash
git-clock plan --hours 4 --murphy 1.2 --unknown 1.1 --macgyver 1.05
```

The realized multiplier from the quantizer is the number the finished
work supports. It is not a fitted M, U, or G. One ratio cannot be split
back into Murphy, Unknown, and MacGyver.

## Burndown

`git-clock burndown cards.json` groups the card file by `sprint` and
prints three series:

| Series | What it is |
|---|---|
| Points remaining | Story points on cards not done, by sprint |
| Clock hours | Sum of `clockHours` in that sprint |
| Billed hours | Sum of `billedHours` in that sprint, when the file has them |

A guide line multiplies points remaining by the quantizer median. The
guide is the calibration drawn across the schedule. It is not a forecast
of the invoice.

## Optimization factor

This runs only when the file has billed hours, a rate, or a fee.

```
optimization = clock hours / billed hours
```

| Factor | Reading |
|---|---|
| 1 | The bill matches the commit clock |
| below 1 | Billed hours run ahead of the clock |
| above 1 | The clock runs ahead of the bill |

When `rate` is set, the report also prints `clock hours × rate` and
`billed hours × rate`. When `fee` is set, the billed amount is `fee`
instead of `billed hours × rate`, and the report adds:

```
effective rate = fee / clock hours
rate factor = (clock hours × rate) / fee
```

Story points stay in the same table as `clock hours / median` on the
done cards, so the three scales sit on one row: hours, points, and money.
The money columns appear only when a rate or a fee was supplied.

```bash
git-clock optimize cards.json
```

## What stays put

- `git-clock` with no premium subcommand prints the commit clock only.
- Clock hours, billed hours, and the billing rate stay three inputs.
- The median does not rewrite open estimates.
- Nothing in this set deploys, pushes, or writes an invoice.
